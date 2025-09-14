import io from "socket.io-client";

type TRegisterPayload = {
    emails?: string[];  
    domain?: string;
};

export class SocketService {
    public socket;
    private socketUrl = import.meta.env.VITE_SOCKET_URL || '';
    private onConnectCallback: (socketId: string) => void = () => {};
    private userInfo: TRegisterPayload | null = null;

    constructor() {
        this.socket = io(this.socketUrl, {
            reconnectionDelayMax: 10000,
            timeout: 50000,
        });

        this.socket.on("connect", () => {
            // Emit register event if userInfo is set
            if (this.userInfo !== null) {
                this.socket.emit("register", this.userInfo);
            }
            this.onConnectCallback(this.socket.id as string);
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        this.socket.connect();
    }

    setOnConnectCallBack(callBack: (id: string) => void) {
        this.onConnectCallback = callBack;
    }

    public register(emails?: string[] | string, domain?: string) {
        const normalizedEmails = Array.isArray(emails) ? emails : emails ? [emails] : undefined;

        this.userInfo = { emails: normalizedEmails, domain };

        if (this.socket.connected) {
            this.socket.emit("register", this.userInfo);
        }
    }

}

const socketService = new SocketService();

export default socketService;
