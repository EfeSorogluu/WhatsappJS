interface EventEmitterEvents {
    'ready': (client: WhatsappJS) => void;
    'message': (message: Message) => void;
    'sent': (message: Message) => void;
}

export class WhatsappJS {
    constructor(API_KEY: string, PHONE_NUMBER: string);
    private client_key: string;
    private client_phone: string;
    start(): Promise<void>;
    webhookServer(config: WebhookConfig): Promise<void>;
    sendMessage(to: PhoneTypes["Receiver"], text: MessageTypes["Text"], options: MessageOptions): Promise<void>;
    checkNumber(phone_number: PhoneTypes["Receiver"]): Promise<any>;
    private getHooks(): Promise<any>;
    on<U extends keyof EventEmitterEvents>(
        event: U, listener: EventEmitterEvents[U]
    ): this;

    private emit<U extends keyof EventEmitterEvents>(
        event: U, ...args: Parameters<EventEmitterEvents[U]>
    ): boolean;
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

export interface CheckNumberResponse {
    is_valid: boolean,
    number: {
        iso_country_code: string,
        region: string,
        carrier?: string,
        timezone: string[]
    },
    on_whatsapp: boolean,
    whatsapp_info?: {
        is_business?: boolean,
        is_enterprise?: boolean,
        profile_pic?: string,
        verified_level?: number,
        verified_name?: string
    }
}

export class Message {
    constructor(data: any, API_KEY: any);
    public id: string;
    public uuid: string;
    public created_at: string;
    public session_key: string;
    public message: { text?: string; media?: { url: string; type: string; mime_type: string; }; };
    public sender_phone_number: string;
    public client_phone_number: string;
    public sent_by: string;
    private client_key: WhatsappJS["client_key"];

    checkNumber(phone_number: PhoneTypes["Receiver"]): Promise<string | boolean | CheckNumberResponse>;
    sendMessage(to: PhoneTypes["Receiver"], text: MessageTypes["Text"], options: MessageOptions): Promise<void>;
    reply(content: MessageTypes["Text"], options: MessageOptions): Promise<void>;
}
