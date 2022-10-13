export default class Utils {
    public static validateURL(link: string) {
        if (link.indexOf("http://") == 0) {
            return false;
        }
        return link.indexOf("https://") == 0;
    }
}
