import axios, { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { POEDITOR_API_URL, POEDITOR_API_TOKEN, PO_PROJECT_ID } from '../constants'

export default class POEditor {

  static async addTerms (data: Array<{term: string}>) {
    return POEditor.callAPI(data, '/terms/add')
  }

  static async updateTerms (terms: object) {
    const data = Object.keys(terms).map((term) => ({
      term,
    }))
    return POEditor.callAPI(data, '/terms/update')
  }

  static async deleteTerms (data: Array<{ term: string }>) {
    return POEditor.callAPI(data, '/terms/delete')
  }

  static async addTranslations (terms: object, language: string) {
    const data = Object.entries(terms).map((term) => ({
      term: term[0],
      translation: {
        content: term[1],
        fuzzy: 0,
      },
    }))
    return POEditor.callAPI(data, '/languages/update', language)
  }

  static async callAPI (data: Array<any>, path: string, language?: string) {

    const body = {
      data: JSON.stringify(data),
      api_token: POEDITOR_API_TOKEN,
      id: PO_PROJECT_ID,
      language,
    }

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
    const response = await axios.post(`${POEDITOR_API_URL}${path}`, qs.stringify(body), config)
    return response.data

  }
}
