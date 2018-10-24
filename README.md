# POEditor - Updater

Automates POEditor based on MR changes to repository translation files.

## Getting Started

1. Deploy the app to your server and get the url, 
1. Add the required url as a webhook to a service (e.g, add `https://yourserver/updatepoeditor` to gitlab as a Merge Request webhook url.

### Prerequisites

Currently there are some manual setup required that can be automated later

1. Get po editor credentials [here](https://poeditor.com/account/api)

1. Get gitlab access token [here](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)

4. env variables as in .env.sample

### Installing

1. Clone the repo
``` 
git clone git@gitlab.com:xmile/po-updater.git 
```
2. add env variables as above depending on your environment

3. start the server
```
npm start
```

## How to use
1. install and start as [above](#installing)
2. you can use a personal Po project to test e.g https://poeditor.com/projects/view?id=232307
4. add your endpoint url as a [webhook to git lab](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html) *OR*
3. you can mock the webhook request from a Gitlab MR by using postman/curl to send a post request to your server `.../api/updatepoeditor` with a body like [this](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#merge-request-events)
3. update the body object value of `object_attributes.iid` to `the iid on the url of a merge request` (e.g `520` for `https://gitlab.com/ee/app/merge_requests/520`)
3. update the body object value of `project.id` to `user/title` (e.g `ee/app`)
8. make the call on postman/curl
9. the po editor should be updated based on the changes in the MR used.

## Contributing

1. you can follow the [how to use](#how-to-use) to get started
1. feel free to contribute to any aspect of the app you deem fit
1. raise an MR against `develop`

## Testing

1. add env variables 
```
export TARGET_BRANCH=master
export MERGE_EVENT=merged
```
2. run `npm test`
## TODO
- [x] retry on fail
- [X] tests
