import { FileLink } from "./consts";
interface BunnyStorageObject {
    ObjectName: string;
    Path: string;
    IsDirectory: boolean;
    StorageZone: string;
    Length: number;
    LastChanged: string;
}

// interface BunnyStorageResponse {
//     files: BunnyStorageObject[];
// }

const { storageZone, apiKey } = getCDNConfig();

export async function getImagesFromFolder(folderPath: string) {
    if (!storageZone || !apiKey) {
        throw new Error("CDN credentials not configured");
    }

    const url = `https://la.storage.bunnycdn.com/${storageZone}/${folderPath}/`;

    try {
        const response = await fetch(url, {
            headers: {
                AccessKey: apiKey,
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as BunnyStorageObject[];

        // filter non-image files
        return data
            .filter((item) => !item.IsDirectory)
            .filter((item) =>
                /\.(jpg|jpeg|png|gif|webp)$/i.test(item.ObjectName)
            )
            .map((item) => ({
                id: item.ObjectName,
                path: `${folderPath}/${item.ObjectName}`,
                lastModified: item.LastChanged,
            }));
    } catch (error) {
        console.error("Error fetching images from BunnyCDN:", error);
        throw error;
    }
}

export async function getFolders(folderPath: string): Promise<FileLink[]> {
    if (!storageZone || !apiKey) {
        throw new Error("CDN credentials not configured");
    }

    const url = `https://la.storage.bunnycdn.com/${storageZone}/${folderPath}/`;

    try {
        const response = await fetch(url, {
            headers: {
                AccessKey: apiKey,
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as BunnyStorageObject[];

        const newdata = data.map((item) => ({
            title: item.ObjectName,
            type: "mypics",
            route: `${folderPath}/${item.ObjectName}`,
        }));

        // return folders
        return newdata;
    } catch (error) {
        console.error("Error fetching images from BunnyCDN:", error);
        throw error;
    }
}

export function getCDNConfig() {
    return {
        pullZone: process.env.NEXT_PUBLIC_CDN_URL || "",
        storageZone: process.env.CDN_STORAGE_ZONE || "",
        apiKey: process.env.CDN_API_KEY || "",
    };
}
