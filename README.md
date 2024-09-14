# dropmb-sharex-server

allows you to upload files directly from sharex to https://dropmb.com

to get started, install nodejs, download (or `git clone`) this repository, and run `npm start`.

to configure sharex, use the following options in the custom uploader settings:
- request url: `http://localhost:9102/upload`
- url: `{response}`
- headers: name `X-Expiration` value: any duration up to 5 years in the format `N-Length` where N is a number and Length one of `minutes, hours, days, weeks, months, years`
- headers: (optional) name `X-Access-Token` value: `access_token=XXXXXXXX`. obtain it from your cookies in devtools
