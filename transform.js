const BUTTON_SOURCE = "@/components/ui/button";
const INPUT_SOURCE = "@/components/ui/input";
const MOTION_SOURCE = "framer-motion";
const TABLE_WRAPPER_CLASS = "bg-card border border-border rounded-lg overflow-hidden";
const TABLE_CLASS_TOKENS = ["w-full", "text-sm"];
const THEAD_CLASS_TOKENS = ["bg-surface", "text-muted"];
const ROW_CLASS_TOKENS = ["hover:bg-surface"];

function transformer(file, api) {
  if (file.path.includes("node_modules")) {
    return null;
  }

  const normalizedPath = file.path.replace(/\\/g, "/");
  const skipButtonTransform = normalizedPath.endsWith("/components/ui/button.tsx");
  const skipInputTransform = normalizedPath.endsWith("/components/ui/input.tsx");
  const skipTableTransform = normalizedPath.endsWith("/components/ui/table.tsx");

  const j = api.jscodeshift;
  const root = j(file.source);
  let didChange = false;
  let needsButtonImport = false;
  let needsInputImport = false;
  let needsMotionImport = false;

  const program = root.get().node.program;

  const normalizeClasses = (classValue) => {
    if (!classValue || typeof classValue !== "string") {
      return classValue;
    }

    const tokens = classValue.split(/\s+/).filter(Boolean);
    const nextTokens = [];

    for (const token of tokens) {
      const replaced = normalizeClassToken(token);
      if (replaced && !nextTokens.includes(replaced)) {
        nextTokens.push(replaced);
      }
    }

    return nextTokens.join(" ");
  };

  const normalizeTemplateElement = (templateElement) => {
    const cooked = templateElement.value.cooked ?? templateElement.value.raw;
    const normalized = normalizeClasses(cooked);

    if (normalized !== cooked) {
      templateElement.value = {
        raw: normalized,
        cooked: normalized,
      };
      didChange = true;
    }
  };

  const normalizeExpression = (expression) => {
    if (!expression) {
      return;
    }

    switch (expression.type) {
      case "StringLiteral":
      case "Literal": {
        if (typeof expression.value === "string") {
          const normalized = normalizeClasses(expression.value);
          if (normalized !== expression.value) {
            expression.value = normalized;
            if (expression.extra && typeof expression.extra.raw === "string") {
              expression.extra.raw = JSON.stringify(normalized);
              expression.extra.rawValue = normalized;
            }
            didChange = true;
          }
        }
        break;
      }
      case "TemplateLiteral":
        expression.quasis.forEach(normalizeTemplateElement);
        expression.expressions.forEach(normalizeExpression);
        break;
      case "ConditionalExpression":
        normalizeExpression(expression.consequent);
        normalizeExpression(expression.alternate);
        break;
      case "LogicalExpression":
        normalizeExpression(expression.left);
        normalizeExpression(expression.right);
        break;
      case "BinaryExpression":
        normalizeExpression(expression.left);
        normalizeExpression(expression.right);
        break;
      case "CallExpression":
        expression.arguments.forEach(normalizeExpression);
        break;
      case "ArrayExpression":
        expression.elements.forEach(normalizeExpression);
        break;
      case "ObjectExpression":
        expression.properties.forEach((property) => {
          if (property.type === "ObjectProperty" || property.type === "Property") {
            normalizeExpression(property.value);
          }
        });
        break;
      case "JSXExpressionContainer":
        normalizeExpression(expression.expression);
        break;
      default:
        break;
    }
  };

  const getJSXName = (name) => {
    if (!name) {
      return null;
    }
    if (name.type === "JSXIdentifier") {
      return name.name;
    }
    if (name.type === "JSXMemberExpression") {
      return `${getJSXName(name.object)}.${getJSXName(name.property)}`;
    }
    return null;
  };

  const getAttribute = (openingElement, attributeName) =>
    openingElement.attributes.find(
      (attribute) =>
        attribute &&
        attribute.type === "JSXAttribute" &&
        attribute.name &&
        attribute.name.name === attributeName
    );

  const appendClassTokens = (openingElement, tokensToAdd) => {
    const classAttribute = getAttribute(openingElement, "className");
    if (!classAttribute) {
      openingElement.attributes.push(
        j.jsxAttribute(j.jsxIdentifier("className"), j.stringLiteral(tokensToAdd.join(" ")))
      );
      didChange = true;
      return;
    }

    if (classAttribute.value?.type === "StringLiteral" || classAttribute.value?.type === "Literal") {
      const existingValue = classAttribute.value.value || "";
      const merged = mergeClassTokens(existingValue, tokensToAdd);
      if (merged !== existingValue) {
        classAttribute.value = j.stringLiteral(merged);
        didChange = true;
      }
      return;
    }

    if (classAttribute.value?.type === "JSXExpressionContainer") {
      const expression = classAttribute.value.expression;
      if (expression.type === "StringLiteral" || expression.type === "Literal") {
        const existingValue = expression.value || "";
        const merged = mergeClassTokens(existingValue, tokensToAdd);
        if (merged !== existingValue) {
          classAttribute.value = j.jsxExpressionContainer(j.stringLiteral(merged));
          didChange = true;
        }
      } else if (expression.type === "TemplateLiteral" && expression.expressions.length === 0) {
        const existingValue = expression.quasis[0]?.value.cooked || "";
        const merged = mergeClassTokens(existingValue, tokensToAdd);
        if (merged !== existingValue) {
          classAttribute.value = j.stringLiteral(merged);
          didChange = true;
        }
      }
    }
  };

  root.find(j.JSXAttribute, { name: { name: "className" } }).forEach((path) => {
    const { value } = path.node;
    if (!value) {
      return;
    }

    if (value.type === "StringLiteral" || value.type === "Literal") {
      const normalized = normalizeClasses(value.value);
      if (normalized !== value.value) {
        path.node.value = j.stringLiteral(normalized);
        didChange = true;
      }
      return;
    }

    if (value.type === "JSXExpressionContainer") {
      normalizeExpression(value.expression);
    }
  });

  if (!skipButtonTransform) {
    root.find(j.JSXElement, { openingElement: { name: { type: "JSXIdentifier", name: "button" } } }).forEach((path) => {
      path.node.openingElement.name = j.jsxIdentifier("Button");
      if (path.node.closingElement) {
        path.node.closingElement.name = j.jsxIdentifier("Button");
      }
      needsButtonImport = true;
      didChange = true;
    });
  }

  if (!skipInputTransform) {
    root.find(j.JSXElement, { openingElement: { name: { type: "JSXIdentifier", name: "input" } } }).forEach((path) => {
      path.node.openingElement.name = j.jsxIdentifier("Input");
      if (path.node.closingElement) {
        path.node.closingElement.name = j.jsxIdentifier("Input");
      }
      needsInputImport = true;
      didChange = true;
    });
  }

  if (!skipTableTransform) {
    root.find(j.JSXElement, { openingElement: { name: { type: "JSXIdentifier", name: "table" } } }).forEach((path) => {
      const openingElement = path.node.openingElement;
      appendClassTokens(openingElement, TABLE_CLASS_TOKENS);

      const tableChildren = path.node.children.filter((child) => child.type === "JSXElement");
      tableChildren.forEach((child) => {
        const childName = getJSXName(child.openingElement.name);
        if (childName === "thead") {
          appendClassTokens(child.openingElement, THEAD_CLASS_TOKENS);
        }
        if (childName === "tbody") {
          child.children
            .filter((rowChild) => rowChild.type === "JSXElement" && getJSXName(rowChild.openingElement.name) === "tr")
            .forEach((rowChild) => appendClassTokens(rowChild.openingElement, ROW_CLASS_TOKENS));
        }
      });

      const parentElement = path.parentPath && path.parentPath.node && path.parentPath.node.type === "JSXElement"
        ? path.parentPath.node
        : null;
      const parentClassAttribute = parentElement ? getAttribute(parentElement.openingElement, "className") : null;
      const parentClasses =
        parentClassAttribute &&
        (parentClassAttribute.value?.type === "StringLiteral" || parentClassAttribute.value?.type === "Literal")
          ? parentClassAttribute.value.value
          : "";

      const alreadyWrapped =
        parentElement &&
        getJSXName(parentElement.openingElement.name) === "div" &&
        parentClasses.includes("bg-card") &&
        parentClasses.includes("border") &&
        parentClasses.includes("border-border") &&
        parentClasses.includes("overflow-hidden");

      if (!alreadyWrapped) {
        const wrapper = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier("div"),
            [j.jsxAttribute(j.jsxIdentifier("className"), j.stringLiteral(TABLE_WRAPPER_CLASS))]
          ),
          j.jsxClosingElement(j.jsxIdentifier("div")),
          [cloneAndSanitizeNode(path.node)]
        );
        j(path).replaceWith(wrapper);
        didChange = true;
      }
    });
  }

  const isTopLevelComponentFunction = (functionPath) => {
    const parent = functionPath.parentPath;
    if (!parent) {
      return false;
    }

    if (parent.node.type === "ExportDefaultDeclaration" || parent.node.type === "Program") {
      return true;
    }

    if (parent.node.type === "VariableDeclarator") {
      const grandParent = parent.parentPath?.parentPath;
      return grandParent?.node.type === "Program" || grandParent?.node.type === "ExportNamedDeclaration";
    }

    return false;
  };

  const hasNestedFunctionBoundary = (returnPath, functionPath) => {
    let current = returnPath.parentPath;
    while (current && current !== functionPath) {
      const type = current.node.type;
      if (
        type === "FunctionDeclaration" ||
        type === "FunctionExpression" ||
        type === "ArrowFunctionExpression"
      ) {
        return true;
      }
      current = current.parentPath;
    }
    return false;
  };

  const wrapReturnWithMotion = (functionPath) => {
    j(functionPath)
      .find(j.ReturnStatement)
      .filter((returnPath) => !hasNestedFunctionBoundary(returnPath, functionPath))
      .forEach((returnPath) => {
        const argument = returnPath.node.argument;
        if (!argument) {
          return;
        }

        if (argument.type === "JSXElement" && getJSXName(argument.openingElement.name) === "motion.div") {
          return;
        }

        if (argument.type === "JSXElement" && getJSXName(argument.openingElement.name) === "html") {
          return;
        }

        if (argument.type !== "JSXElement" && argument.type !== "JSXFragment") {
          return;
        }

        const motionWrapper = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxMemberExpression(j.jsxIdentifier("motion"), j.jsxIdentifier("div")),
            [
              buildObjectAttribute(j, "initial", { opacity: 0, y: 8 }),
              buildObjectAttribute(j, "animate", { opacity: 1, y: 0 }),
              buildObjectAttribute(j, "transition", { duration: 0.2 }),
            ]
          ),
          j.jsxClosingElement(j.jsxMemberExpression(j.jsxIdentifier("motion"), j.jsxIdentifier("div"))),
          [cloneAndSanitizeNode(argument)]
        );

        returnPath.node.argument = motionWrapper;
        needsMotionImport = true;
        didChange = true;
      });
  };

  root
    .find(j.FunctionDeclaration)
    .filter(isTopLevelComponentFunction)
    .forEach(wrapReturnWithMotion);

  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const init = path.node.init;
      return init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression");
    })
    .forEach((path) => {
      if (isTopLevelComponentFunction(path.get("init"))) {
        wrapReturnWithMotion(path.get("init"));
      }
    });

  if (needsButtonImport) {
    ensureImport(j, program, BUTTON_SOURCE, {
      type: "default",
      imported: "Button",
      local: "Button",
    });
  }

  if (needsInputImport) {
    ensureImport(j, program, INPUT_SOURCE, {
      type: "named",
      imported: "Input",
      local: "Input",
    });
  }

  if (needsMotionImport) {
    ensureImport(j, program, MOTION_SOURCE, {
      type: "named",
      imported: "motion",
      local: "motion",
    });
  }

  mergeImports(j, program);

  if (!didChange) {
    return null;
  }

  return root
    .toSource({
        quote: "double",
        trailingComma: true,
      })
    .replace(/"use client";;/g, "\"use client\";");
}

module.exports = transformer;
module.exports.parser = "tsx";

function normalizeClassToken(token) {
  const segments = token.split(":");
  const base = segments.pop();
  const variantPrefix = segments.length ? `${segments.join(":")}:` : "";

  if (!base) {
    return token;
  }

  if (base.startsWith("bg-gradient")) {
    return null;
  }

  if (base.startsWith("from-") || base.startsWith("to-") || base.startsWith("via-")) {
    return null;
  }

  if (base === "white" || base === "text-white" || base === "text-black") {
    return `${variantPrefix}text`;
  }

  if (base.startsWith("bg-gray-") || base.startsWith("bg-blue-") || base.startsWith("bg-white") || /^bg-\[#/.test(base)) {
    return `${variantPrefix}bg-card`;
  }

  if (base.startsWith("text-gray-") || base.startsWith("text-blue-") || base.startsWith("text-white/") || base.startsWith("text-black/")) {
    return `${variantPrefix}text-muted`;
  }

  if (base.startsWith("border-gray-") || base.startsWith("border-blue-") || base.startsWith("border-white") || /^border-\[#/.test(base)) {
    return `${variantPrefix}border-border`;
  }

  if (base === "bg-[var(--card)]") {
    return `${variantPrefix}bg-card`;
  }

  if (base === "bg-[var(--surface)]") {
    return `${variantPrefix}bg-surface`;
  }

  if (base === "text-[var(--muted)]") {
    return `${variantPrefix}text-muted`;
  }

  if (base === "border-[var(--border)]") {
    return `${variantPrefix}border-border`;
  }

  if (base === "hover:bg-white/5") {
    return "hover:bg-surface";
  }

  if (base.startsWith("hover:bg-white")) {
    return `${variantPrefix}bg-surface`;
  }

  return token;
}

function mergeClassTokens(classValue, tokensToAdd) {
  const existingTokens = classValue.split(/\s+/).filter(Boolean);
  tokensToAdd.forEach((token) => {
    if (!existingTokens.includes(token)) {
      existingTokens.push(token);
    }
  });
  return existingTokens.join(" ");
}

function buildObjectAttribute(j, name, values) {
  const properties = Object.entries(values).map(([key, value]) =>
    j.property("init", j.identifier(key), typeof value === "number" ? j.numericLiteral(value) : j.literal(value))
  );

  return j.jsxAttribute(
    j.jsxIdentifier(name),
    j.jsxExpressionContainer(j.objectExpression(properties))
  );
}

function cloneAndSanitizeNode(node) {
  return sanitizeNode(JSON.parse(JSON.stringify(node)));
}

function sanitizeNode(node) {
  if (Array.isArray(node)) {
    return node.map((item) => sanitizeNode(item));
  }

  if (!node || typeof node !== "object") {
    return node;
  }

  if (node.type === "ParenthesizedExpression") {
    return sanitizeNode(node.expression);
  }

  if (node.extra && typeof node.extra === "object") {
    delete node.extra.parenthesized;
  }

  if ("parenthesized" in node) {
    delete node.parenthesized;
  }

  Object.keys(node).forEach((key) => {
    node[key] = sanitizeNode(node[key]);
  });

  return node;
}

function ensureImport(j, program, source, specifier) {
  const existingImports = program.body.filter(
    (node) => node.type === "ImportDeclaration" && node.source.value === source
  );

  if (existingImports.length === 0) {
    const newImport = j.importDeclaration([], j.literal(source));
    if (specifier.type === "default") {
      newImport.specifiers = [j.importDefaultSpecifier(j.identifier(specifier.local))];
    } else if (specifier.type === "named") {
      newImport.specifiers = [
        j.importSpecifier(j.identifier(specifier.imported), j.identifier(specifier.local)),
      ];
    }

    const insertionIndex = program.body.findIndex((node) => node.type !== "ImportDeclaration");
    if (insertionIndex === -1) {
      program.body.push(newImport);
    } else {
      program.body.splice(insertionIndex, 0, newImport);
    }
    return;
  }

  const firstImport = existingImports[0];
  const specifiers = firstImport.specifiers || [];

  const alreadyPresent = specifiers.some((existingSpecifier) => {
    if (specifier.type === "default") {
      return existingSpecifier.type === "ImportDefaultSpecifier" && existingSpecifier.local.name === specifier.local;
    }
    return (
      existingSpecifier.type === "ImportSpecifier" &&
      existingSpecifier.imported.name === specifier.imported &&
      existingSpecifier.local.name === specifier.local
    );
  });

  if (!alreadyPresent) {
    if (specifier.type === "default") {
      specifiers.unshift(j.importDefaultSpecifier(j.identifier(specifier.local)));
    } else {
      specifiers.push(j.importSpecifier(j.identifier(specifier.imported), j.identifier(specifier.local)));
    }
    firstImport.specifiers = specifiers;
  }
}

function mergeImports(j, program) {
  const imports = program.body.filter((node) => node.type === "ImportDeclaration");
  const others = program.body.filter((node) => node.type !== "ImportDeclaration");
  const seen = new Map();
  const mergedImports = [];

  imports.forEach((importDeclaration) => {
    const source = importDeclaration.source.value;
    if (!seen.has(source)) {
      seen.set(source, j.importDeclaration([], j.literal(source)));
      mergedImports.push(seen.get(source));
    }

    const target = seen.get(source);
    const targetSpecifiers = target.specifiers || [];
    const sourceSpecifiers = importDeclaration.specifiers || [];

    if (sourceSpecifiers.length === 0 && targetSpecifiers.length === 0) {
      return;
    }

    sourceSpecifiers.forEach((specifier) => {
      const signature = getImportSpecifierSignature(specifier);
      const exists = targetSpecifiers.some((currentSpecifier) => getImportSpecifierSignature(currentSpecifier) === signature);
      if (!exists) {
        targetSpecifiers.push(specifier);
      }
    });

    target.specifiers = sortImportSpecifiers(targetSpecifiers);
  });

  program.body = [...mergedImports, ...others];
}

function getImportSpecifierSignature(specifier) {
  if (specifier.type === "ImportDefaultSpecifier") {
    return `default:${specifier.local.name}`;
  }
  if (specifier.type === "ImportNamespaceSpecifier") {
    return `namespace:${specifier.local.name}`;
  }
  return `named:${specifier.imported.name}:${specifier.local.name}`;
}

function sortImportSpecifiers(specifiers) {
  const defaults = specifiers.filter((specifier) => specifier.type === "ImportDefaultSpecifier");
  const namespaces = specifiers.filter((specifier) => specifier.type === "ImportNamespaceSpecifier");
  const named = specifiers
    .filter((specifier) => specifier.type === "ImportSpecifier")
    .sort((left, right) => left.imported.name.localeCompare(right.imported.name));

  return [...defaults, ...namespaces, ...named];
}
