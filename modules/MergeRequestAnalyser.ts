import { transform } from 'lodash'
import axios from 'axios'
import { GITLAB_BASE_URL, GITLAB_PRIVATE_TOKEN } from '../constants'

export type TranslationChanges = {
  translations: object,
  allAddedTerms: Array<string>,
  allRemovedTerms: Array<string>,
}
export default class MergeRequestAnalyser {

  static parseChanges (diff: string, regex: RegExp, lineRegex: RegExp) {
    const raw = diff.match(regex)
    if (raw && raw.length) {
      const matched = raw.reduce((acc, a) => {
        const pair = a.match(lineRegex)
        const obj = JSON.parse(`{${pair[1]}}`)
        return { ...acc, ...obj }
      }, {})
      return matched
    }
    return {}
  }

  static async getTranslationChanges (projectId: string | number, MRIID: number): Promise<TranslationChanges> {
    const config = {
      headers: {
        'PRIVATE-TOKEN': GITLAB_PRIVATE_TOKEN,
      },
    }
    const { data: { changes } } = await axios.get(`${GITLAB_BASE_URL}/projects/${encodeURIComponent(`${projectId}`)}/merge_requests/${MRIID}/changes`, config)
    const allAddedTerms = []
    const allRemovedTerms = []
    const translations = {}

    changes.forEach(({ new_path, diff }) => {
      if (new_path.includes('app/translations/')) {
        const language = new_path.match(/app\/translations\/(.*)\.json/)[1]
        try {
          const addedTerms = MergeRequestAnalyser.parseChanges(diff, /^\+(.*),$/gm, /^\+(.*),$/)
          const removed = MergeRequestAnalyser.parseChanges(diff, /^-(.*),$/gm, /^-(.*),$/)
          const modified = {}

          const added = transform(addedTerms, (result = {}, value: string, key: string) => {
            if (removed[key]) {
              modified[key] = value
              delete removed[key]
              return result
            }
            result[key] = value
            if (!allAddedTerms.includes(key)) {
              allAddedTerms.push(key)
            }
            return result
          })

          Object.keys(removed).forEach((removedTermKey) => {
            if (!allRemovedTerms.includes(removedTermKey)) {
              allRemovedTerms.push(removedTermKey)
            }
          })

          translations[language] = { ...added, ...modified }

        } catch (e) {
          throw new Error(`langauge: ${language} error: ${e}`)
        }
      }
    })

    return {
      translations,
      allAddedTerms,
      allRemovedTerms,
    }
  }
}
