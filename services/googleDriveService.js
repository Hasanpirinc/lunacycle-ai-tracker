let tokenClient = null;
const FOLDER_NAME = 'LunaCycleData';

export const initClient = (clientId) => {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                });

                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: 'https://www.googleapis.com/auth/drive.file',
                    callback: () => {},
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
};

export const signIn = () => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            return reject(new Error("Google Drive client not initialized."));
        }

        if (gapi.client.getToken() !== null) {
            return resolve();
        }

        tokenClient.callback = (resp) => {
            if (resp.error !== undefined) {
                reject(resp);
            }
            resolve();
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};

export const signOut = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
        });
    }
};

export const findOrCreateFolder = async () => {
    try {
        const response = await gapi.client.drive.files.list({
            q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (response.result.files && response.result.files.length > 0) {
            return response.result.files[0].id;
        } else {
            const fileMetadata = {
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            };
            const newFolderResponse = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id',
            });
            return newFolderResponse.result.id;
        }
    } catch (error) {
        console.error("Error finding or creating folder:", error);
        throw new Error("Could not access the app folder in Google Drive.");
    }
};

export const saveData = async (folderId, data) => {
    const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json.encrypted`;
    const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const multipartRequestBody = [
        delimiter,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        delimiter,
        'Content-Type: application/json\r\n\r\n',
        data,
        close_delim
    ].join('');

    const response = await gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
    });

    return response.result;
};

export const listBackups = async (folderId) => {
    const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id, name, modifiedTime, size)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
    });
    return response.result.files || [];
};

export const loadData = async (fileId) => {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        if (response.body) {
            return response.body;
        }
        return null;
    } catch (error) {
        if (error.status === 404) {
             console.log("Data file is empty or not found.");
             return null;
        }
        console.error("Error loading data from Drive:", error);
        throw new Error("Failed to load data from Google Drive.");
    }
};