export interface NotificationMessage {
  recipientId: string;
  subject: string;
  body: string;
}

export interface NotificationChannel {
  readonly name: string;
  send(message: NotificationMessage): Promise<void>;
}

export class NotificationService {
  constructor(
    private readonly channels: NotificationChannel[]
  ) {}

  async notify(message: NotificationMessage): Promise<void> {
    for (const channel of this.channels) {
      await channel.send(message);
    }
  }
}
