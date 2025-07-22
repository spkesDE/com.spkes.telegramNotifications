import {TelegramNotifications} from "../../app";
import {FlowCardAction} from "homey";
import Utils from "../../utils";

export default class sendLocation {
    /**
     * Constructs a new instance of the class and registers a run listener for the provided card.
     * The run listener sends a location message to the specified user using the provided latitude and longitude.
     *
     * @param {TelegramNotifications} app - The TelegramNotifications instance.
     * @param {FlowCardAction} card - The FlowCardAction instance.
     */
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                // if args.latitude and args.longitude are not null, send a location message
                if (args.latitude != null && args.longitude != null) {
                    try {
                        await app.bot.api.sendLocation(args.user.id, args.latitude, args.longitude, {
                            message_thread_id: args.user.topic
                        });
                    } catch (err) {
                        console.error('Error sending location message:', err);
                        app.error(err);
                        throw err;
                    }
                } else if (args.location != null) {
                    //Validate location format latitude,longitude or latitude, longitude
                    //Return new Error('Invalid location format. Use <latitude>,<longitude> or <latitude>, <longitude> format. e.g. 40.7128,74.0060')
                    const locationRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
                    if (!locationRegex.test(args.location)) {
                        app.error('Invalid location format. Use <latitude>,<longitude> or <latitude>, <longitude> format. e.g. 40.7128,74.0060');
                        console.error('Invalid location format. Use <latitude>,<longitude> or <latitude>, <longitude> format. Input: ' + args.location);
                        throw new Error('Invalid location format. Use <latitude>,<longitude> or <latitude>, <longitude> format. e.g. 40.7128,74.0060');
                    }

                    try {
                        //Split latitude,longitude
                        const [latitude, longitude] = args.location.replace(/\s/g, '').split(',');
                        await app.bot.api.sendLocation(args.user.id, Number(latitude), Number(longitude), {
                            message_thread_id: args.user.topic
                        });
                    } catch (err) {
                        console.error('Error sending location message:', err);
                        app.error(err);
                        throw err;
                    }
                }
            }
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.chats, query)
        );
    }
}