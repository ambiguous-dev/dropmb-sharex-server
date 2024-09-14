# dropmb-sharex-server

allows you to upload files directly from sharex to https://dropmb.com

to get started, install nodejs, download (or `git clone`) this repository, and run `npm start`.

to configure sharex, use the following options in the custom uploader settings:
- request url: `http://localhost:9102/upload`
- url: `{response}`
- headers: name `X-Expiration` value: any duration up to 5 years in the format `N-Length` where N is a number and Length one of `minutes, hours, days, weeks, months, years`
- headers: (optional) name `X-Access-Token` value: `access_token=XXXXXXXX`. obtain it from your cookies in devtools
- headers: (optional) name `X-Shortener-Key` value: your sharex key
- headers: (optional) name `X-Redir-Domain` value: your dmain

`X-Expiration` allows you to configure the length before the file expires.

`X-Access-Token` allows the upload to be linked to your account.

`X-Shortener-Key` will shorten the URL with E-Z.

`X-Redir-Domain` will replace the E-Z shortened domain with another, useful if you have a domain set to redirect to E-Z.
