// index.d.ts

declare class WhatsappJS {
    constructor(API_KEY: string, PHONE_NUMBER: string);

    start(): Promise<void>;
    webhookServer(config: WebhookConfig): Promise<void>;
    sendMessage(to: Types.ReceiverPhone, text: MessageTypes.Text, options: MessageOptions): void;
    checkNumber(phone_number: PhoneTypes.Receiver): Promise<any>;
    getHooks(): Promise<any[]>;

    on(event: 'ready', listener: (number: any) => void): this;
    on(event: 'message', listener: (eventData: Message) => void): this;
    on(event: 'sent_message', listener: (eventData: SentMessageEventData) => void): this;
    // diğer event'ler
}

declare const Events: {
    CallReceived: "whatsapp.call.received";
    NewMessage: "whatsapp.message.new";
    // diğer event'ler
};

declare class WebhookConfig {
    port: number;
    path: string;
    host_name: string;
    events: string[];
    public: {
        name: string;
        path: string;
    };
}

declare class PhoneTypes {
    Receiver: "0";
    PhoneNumber: "String";
}

declare class MessageTypes {
    Text: "string";
    URL: "string";
}

declare class MessageOptions {
    file_url: string;
}

declare class Message {
    constructor(data: any, API_KEY: string);

    reply(content: MessageTypes.Text, options: MessageOptions): Promise<void>;
}

declare interface SentMessageEventData {
    id: string;
    uuid: string;
    created_at: string;
    session_key: string;
    message: {
        text: string;
        media: {
            url: string | null;
            type: string | null;
            mime_type: string | null;
        };
    };
    sended_phone_number: string;
    client_phone_number: string;
    sent_by: string;
}
