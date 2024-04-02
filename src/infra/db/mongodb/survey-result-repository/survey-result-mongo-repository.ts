import { type SaveSurveyResultRepository } from '@/data/protocols/db/survey-result/save-survey-result-repository'
import { type SurveyResultModel } from '@/domain/models/survey-result'
import { type SaveSurveyResultParams } from '@/domain/usecases/survey-result/save-survey-result'
import { MongoHelper } from '../helpers/mogo-helper'
import { ObjectId } from 'mongodb'
import { InvalidParamError } from '@/presentation/errors'
import { type LoadSurveyResultRepository } from '@/data/protocols/db/survey-result/load-survey-result-repository'

export class SurveyResultMongoRepository implements SaveSurveyResultRepository, LoadSurveyResultRepository {
  async save (data: SaveSurveyResultParams): Promise<void> {
    const surveysCollection = await MongoHelper.getCollection('surveys')
    const surveyObjectId = new ObjectId(data.surveyId)
    const survey = await surveysCollection.findOne({ _id: surveyObjectId })

    const accountsCollection = await MongoHelper.getCollection('accounts')
    const accountObjectId = new ObjectId(data.accountId)
    const account = await accountsCollection.findOne({ _id: accountObjectId })

    if (survey && account) {
      const surveyResultCollection = await MongoHelper.getCollection('surveyResults')
      await surveyResultCollection.findOneAndUpdate({
        surveyId: surveyObjectId,
        accountId: accountObjectId
      }, {
        $set: {
          answer: data.answer,
          date: data.date
        }
      }, {
        upsert: true,
        returnDocument: 'after'
      })
    } else if (account) {
      throw new InvalidParamError('surveyId')
    } else throw new InvalidParamError('accountId')
  }

  async loadBySurveyId (surveyId: string): Promise<SurveyResultModel | null> {
    const surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    const query = surveyResultCollection.aggregate<SurveyResultModel>(
      [
        {
          $match: {
            surveyId: new ObjectId(surveyId)
          }
        },
        {
          $group: {
            _id: {
              answer: '$answer',
              surveyId: '$surveyId'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: 0,
            data: { $push: '$$ROOT' },
            total: { $sum: '$count' }
          }
        },
        {
          $lookup: {
            from: 'surveys',
            localField: 'data._id.surveyId',
            foreignField: '_id',
            as: 'survey'
          }
        },
        { $unwind: { path: '$survey' } },
        { $unwind: { path: '$survey.answers' } },
        {
          $project: {
            question: '$survey.question',
            date: '$survey.date',
            surveyId: '$survey._id',
            answer: '$survey.answers.answer',
            image: '$survey.answers.image',
            infos: {
              $filter: {
                input: '$data',
                as: 'item',
                cond: {
                  $eq: [
                    '$survey.answers.answer',
                    '$$item._id.answer'
                  ]
                }
              }
            },
            total: '$total'
          }
        },
        {
          $unwind: {
            path: '$infos',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              question: '$question',
              date: '$date',
              surveyId: '$surveyId'
            },
            answers: {
              $push: {
                image: '$image',
                answer: '$answer',
                count: { $max: ['$infos.count', 0] },
                percent: {
                  $max: [
                    0,
                    {
                      $multiply: [
                        100,
                        {
                          $divide: [
                            '$infos.count',
                            '$total'
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            surveyId: {
              $toString: '$_id.surveyId'
            },
            question: '$_id.question',
            date: '$_id.date',
            answers: '$answers'
          }
        }
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    )

    const surveyResult = await query.toArray()
    return surveyResult?.length ? surveyResult[0] : null
  }
}
