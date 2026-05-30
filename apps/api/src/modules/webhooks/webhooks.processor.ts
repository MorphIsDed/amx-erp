import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as crypto from 'crypto';

@Processor('webhooks')
export class WebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhooksProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { subscriptionId, url, secret, eventType, payload } = job.data;
    this.logger.log(`Processing webhook dispatch job ${job.id} for subscription ${subscriptionId}`);

    const timestamp = Math.floor(Date.now() / 1000);
    const bodyString = JSON.stringify({
      event: eventType,
      timestamp,
      data: payload,
    });

    // Compute HMAC-SHA256 Signature
    const signaturePayload = `${timestamp}.${bodyString}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signaturePayload)
      .digest('hex');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AMX-ERP-Webhook-Dispatcher/1.0',
          'X-AMX-Signature': signature,
          'X-AMX-Timestamp': timestamp.toString(),
        },
        body: bodyString,
        // Wait at most 5 seconds for the webhook target to respond
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Receiver returned status code: ${response.status}`);
      }

      this.logger.log(`Webhook dispatch job ${job.id} succeeded with status ${response.status}`);
      return { success: true, status: response.status };
    } catch (error) {
      this.logger.error(`Webhook dispatch job ${job.id} failed: ${error.message}`);
      
      // If this was the last attempt, log to DLQ
      if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
        this.logger.error(`Webhook subscription ${subscriptionId} reached max retry limit. Routing to DLQ.`);
      }

      throw error; // Re-throw to trigger BullMQ's automatic retry backoffs
    }
  }
}
