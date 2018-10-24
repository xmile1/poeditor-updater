/* global Promise */
import { APIGatewayEvent, Handler } from 'aws-lambda'
import MergeRequestAnalyser, { TranslationChanges } from '../modules/MergeRequestAnalyser'
import POEditor from '../modules/PoEditor'
import { map, isEmpty } from 'lodash'
import Notifier from '../modules/Notifier'
import { MERGE_EVENT, TARGET_BRANCH, SENTRY_DSN } from '../constants'
import * as Raven from 'raven'

Raven.config(SENTRY_DSN, {
  environment: process.env.NODE_ENV,
}).install()

export const update: Handler = async (req: APIGatewayEvent) => {
  try {
    const { project: { id }, object_attributes: { action, iid, target_branch } } = JSON.parse(req.body)
    if (action === MERGE_EVENT && target_branch === TARGET_BRANCH) {
      const translationChanges: TranslationChanges = await MergeRequestAnalyser.getTranslationChanges(id, iid)

      translationChanges.allAddedTerms.length &&
      await POEditor.addTerms(translationChanges.allAddedTerms.map((term) => ({ term })))
      translationChanges.allRemovedTerms.length &&
      await POEditor.deleteTerms(translationChanges.allRemovedTerms.map((term) => ({ term })))
      await Promise.all(map(translationChanges.translations, async (value: object, key: string) => {
        if (!isEmpty(value)) {
          await POEditor.addTranslations(value, key)
        }
      }))

      if (translationChanges.allAddedTerms.length ||
        translationChanges.allRemovedTerms.length ||
        !isEmpty(translationChanges.translations)) {
        await Notifier.sendPassToSlack(translationChanges)
      }
      return ({
        statusCode: 200,
        body: JSON.stringify({ message: 'complete', translationChanges }),
      })

    }
    return ({
      statusCode: 200,
      body: JSON.stringify({ message: 'skipped' }),
    })
  } catch (error) {
    Raven.captureException(error)
    await Notifier.sendFailureToSlack({ error: error.message })
    return ({
      statusCode: 500,
      body: error.message,
    })
  }
}
