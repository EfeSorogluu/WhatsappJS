interface EventEmitterEvents {
    'ready': (client: WhatsappJS) => void;
    'message': (message: Message) => void;
    'sent_by_api': (message: APIMessage) => void;
    'sent_by_agent': (message: AgentMessage) => void;
    'group_message': (message: GroupMessage) => void;
}

export class WhatsappJS {
    constructor(API_KEY: string, PHONE_NUMBER: string);
    private client_key: string;
    private client_phone: string;

    public id: string;
    public uuid: string;
    public client_name: string;
    public phone_number: string;
    public country_code: string;
    public pushname: string;
    public server: string;
    public platform: string;
    public connection_status: string;
    public enabled: boolean;
    public is_business_profile: boolean;
    public channel_type: string;
    public sync_contacts: boolean;
    public timezone: string;
    public lang: string;
    public created_at: string;
    public updated_at: string;
    public site: {
        uuid: string,
        name: string | null,
        is_default: boolean
    };
    public timezone_phone_number: string;

    start(): Promise<void>;
    webhookServer(config: WebhookConfig): Promise<void>;
    sendMessage(to: PhoneTypes["Receiver"], text: MessageTypes["Text"], options: MessageOptions): Promise<void>;
    checkNumber(phone_number: PhoneTypes["Receiver"]): Promise<any>;
    private getHooks(): Promise<any>;

    on<U extends keyof EventEmitterEvents>(
        event: U, listener: EventEmitterEvents[U]
    ): this;

    once<U extends keyof EventEmitterEvents>(
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
    /**
     * @description Web Port (Default: 3000)
     * @default port: 3000
     */
  port: number;
  /**
   * @description Path to POST webhook events (default: /webhooks/whatsapp)
   * @default path: "/webhooks/whatsapp"
   */
  path: string;
  /**
   * @description Your server hostname or the connection address from a service provider such as ngrok. For example: https://<your_url>.ngrok-free.app
   * @example host_name: "https://<your_url>.ngrok-free.app"
   */
  host_name: string;
  /**
   * @description Adds the events you want to listen to to the webhook. You can read the 2Chat API Documentation to learn more about events: https://developers.2chat.co/docs/API/WhatsApp/webhooks/subscribe
   */
  events: WebhookEvents[];
  public: {
    /**
     * @description The name under which your public file will be published and publicly visible on the web server.
     * @example name: "/public"
     */
    name: string;
    /**
     * @description The path to your public file, i.e. the file that will be published publicly. For example: C:/path/to/public
     * @example path: "C:/path/to/public"
     */
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

export interface Group {
    uuid: string,
    channel_uuid: string,
    wa_group_id: string,
    profile_pic_url: string,
    wa_owner_id: string,
    wa_group_name: string,
    wa_created_at: string,
    wa_subject: string,
    size: number,
    is_muted: boolean,
    is_read_only: boolean,
    channel_is_owner: boolean,
    created_at: string,
    updated_At: string,
    owner_contact?: {
        uuid: string | null,
        first_name: string | null,
        last_name: string | null,
        channel_uuid: string | null,
        profile_pic_url: string | null,
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

export class GroupMessage {
    constructor(data: any, API_KEY: any);
    public id: string;
    public uuid: string;
    public created_at: string;
    public session_key: string;
    public message: { text?: string; media?: { url: string; type: string; mime_type: string; }; };
    public sender_phone_number: string;
    public client_phone_number: string;
    public sent_by: string;
    public contact: { first_name: string | null, last_name: string | null, profile_pic_url: string | null };
    public participants: { phone_number: PhoneTypes["Receiver"], device: string, pushname: string }
    private client_key: WhatsappJS["client_key"];

    checkNumber(phone_number: PhoneTypes["Receiver"]): Promise<string | boolean | CheckNumberResponse>;
    sendMessage(to: PhoneTypes["Receiver"], text: MessageTypes["Text"], options: MessageOptions): Promise<void>;
    reply(content: MessageTypes["Text"], options: MessageOptions): Promise<void>;
    info(): Promise<Group>
}

export class APIMessage {
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
}

export class AgentMessage {
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
}
