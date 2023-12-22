export class WhatsappJS {
    constructor(API_KEY: string, PHONE_NUMBER: string);
    client_key: string;
    client_phone: string;
    start(): Promise<void>;
    webhookServer(config: WebhookConfig): Promise<void>;
    sendMessage(to: PhoneTypes["Receiver"], text: MessageTypes["Text"], options: MessageOptions): Promise<void>;
    checkNumber(phone_number: PhoneTypes["Receiver"]): Promise<any>;
    getHooks(): Promise<any>;
}

export type WebhookEvents =
  | "whatsapp.call.received"
  | "whatsapp.message.new"
  | "whatsapp.message.received"
  | "whatsapp.message.sent"
  | "whatsapp.conversation.new"
  | "whatsapp.audio.transcribed"
  | "whatsapp.group.message.received"
  | "whatsapp.group.join"
  | "whatsapp.group.leave"
  | "whatsapp.group.remove";

export interface WebhookConfig {
  port: number;
  path: string;
  host_name: string;
  events: WebhookEvents[];
  public: {
    name: string;
    path: string;
  };
}

export interface PhoneTypes {
    Receiver: string;
    PhoneNumber: string;
}

export interface MessageTypes {
    Text: string;
    URL: string;
}

export interface MessageOptions {
    file_url: string;
}

export class Message extends WhatsappJS {
    constructor(data: any, API_KEY: any);
    client_key: WhatsappJS["client_key"];
    id: string;
    uuid: string;
    created_at: string;
    session_key: string;
    message: {
        text: string;
        media: {
            url: string;
            type: string;
            mime_type: string;
        };
    };
    sender_phone_number: string;
    client_phone_number: string;
    sent_by: string;

    reply(content: MessageTypes["Text"], options: MessageOptions): Promise<void>;
}
