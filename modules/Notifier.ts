import axios from 'axios'
import { SLACK_SUCCESS_WEBHOOK_URL, SLACK_FAILED_WEBHOOK_URL } from '../constants'
import { TranslationChanges } from '../modules/MergeRequestAnalyser'
import { forEach } from 'lodash'

export default class Notifier {

  static async sendPassToSlack (data: TranslationChanges) {
    const text = Notifier.formatPassMessageForSlack(data)
    return Notifier.sendToSlack(SLACK_SUCCESS_WEBHOOK_URL, text)
  }

  static async sendFailureToSlack (data: any) {
    const text = `\`\`\`${JSON.stringify(data, null, '\t')}\`\`\``
    return Notifier.sendToSlack(SLACK_FAILED_WEBHOOK_URL, text)
  }

  static async sendToSlack (SLACK_WEBHOOK_URL: string, text: any) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const body = {
      text,
    }
    const response = await axios.post(SLACK_WEBHOOK_URL, body, config)
    return response.data
  }

  static formatPassMessageForSlack (data: TranslationChanges) {

    let slackString = ''

    slackString += `
:heavy_plus_sign: *ADDED TERMS*
• \`${data.allAddedTerms.join('\`\n • \`')}\`

:x: *REMOVED TERMS*
• \`${data.allRemovedTerms.join('\`\n • \`')}\`

*ADDED/MODIFIED TRANSLATIONS*

`
    forEach(data.translations,(value, key) => {
      slackString += `  _${key}_
${JSON.stringify(value, null, 2).trim()
          .replace('{', '')
          .replace(/}$/, '').trim()
          // replace the quotation marks in the terms with backticks
          .replace(/^.{0,2}"/gm, '• \`')
          .replace(/"(?=:)/gm, '\`')}

`
    })
    return slackString
  }

}
