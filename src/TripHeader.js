// @flow
import { Angle, Length, UnitizedNumber } from 'unitized'

import {
  type DisplayAzimuthUnit,
  type DisplayInclinationUnit,
  type DisplayLengthUnit,
  type LrudItem,
  type ShotMeasurementItem,
  type StationSide,
} from './types'

export const azimuthUnits: { [string]: DisplayAzimuthUnit } = {
  D: 'degrees',
  Q: 'quads',
  G: 'gradians',
}
export const inclinationUnits: { [string]: DisplayInclinationUnit } = {
  D: 'degrees',
  G: 'percentGrade',
  M: 'degreesAndMinutes',
  R: 'gradians',
  W: 'depthGauge',
}
export const lengthUnits: { [string]: DisplayLengthUnit } = {
  D: 'decimalFeet',
  I: 'feetAndInches',
  M: 'meters',
}
export const lrudItems: { [string]: LrudItem } = {
  L: 'left',
  R: 'right',
  U: 'up',
  D: 'down',
}
export const shotMeasurementItems: { [string]: ShotMeasurementItem } = {
  L: 'length',
  A: 'frontsightAzimuth',
  D: 'frontsightInclination',
  a: 'backsightAzimuth',
  d: 'backsightInclination',
}
export const stationSides: { [string]: StationSide } = {
  F: 'from',
  T: 'to',
}

function invert<K: string, V: string>(obj: { [K]: V }): { [V]: K } {
  const result: { [V]: K } = {}
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    result[obj[(key: any)]] = (key: any)
  }
  return result
}

const inverseAzimuthUnits = invert(azimuthUnits)
const inverseInclinationUnits = invert(inclinationUnits)
const inverseLengthUnits = invert(lengthUnits)
const inverseLrudItems = invert(lrudItems)
const inverseShotMeasurementItems = invert(shotMeasurementItems)
const inverseStationSides = invert(stationSides)

export type TripHeaderProps = {|
  caveName?: ?string,
  surveyName?: ?string,
  date: Date,
  comment?: ?string,
  surveyors: Array<string>,
  rawSurveyors?: ?string,
  declination: UnitizedNumber<Angle>,
  displayAzimuthUnit: DisplayAzimuthUnit,
  displayLengthUnit: DisplayLengthUnit,
  displayLrudUnit: DisplayLengthUnit,
  displayInclinationUnit: DisplayInclinationUnit,
  lrudOrder: Array<LrudItem>,
  shotMeasurementOrder: Array<ShotMeasurementItem>,
  hasBacksights: boolean,
  lrudAssociation?: ?StationSide,
  lengthCorrection: UnitizedNumber<Length>,
  frontsightAzimuthCorrection: UnitizedNumber<Angle>,
  frontsightInclinationCorrection: UnitizedNumber<Angle>,
  backsightAzimuthCorrection?: ?UnitizedNumber<Angle>,
  backsightInclinationCorrection?: ?UnitizedNumber<Angle>,
|}

export default class TripHeader {
  caveName: ?string
  surveyName: ?string
  date: Date
  comment: ?string
  surveyors: Array<string>
  rawSurveyors: ?string
  declination: UnitizedNumber<Angle>
  displayAzimuthUnit: DisplayAzimuthUnit
  displayLengthUnit: DisplayLengthUnit
  displayLrudUnit: DisplayLengthUnit
  displayInclinationUnit: DisplayInclinationUnit
  lrudOrder: Array<LrudItem>
  shotMeasurementOrder: Array<ShotMeasurementItem>
  hasBacksights: boolean
  lrudAssociation: ?StationSide
  lengthCorrection: UnitizedNumber<Length>
  frontsightAzimuthCorrection: UnitizedNumber<Angle>
  frontsightInclinationCorrection: UnitizedNumber<Angle>
  backsightAzimuthCorrection: ?UnitizedNumber<Angle>
  backsightInclinationCorrection: ?UnitizedNumber<Angle>

  constructor(props: TripHeaderProps) {
    Object.assign(this, props)
  }

  _formatFormat(): string {
    const {
      displayAzimuthUnit,
      displayLengthUnit,
      displayLrudUnit,
      displayInclinationUnit,
      lrudOrder,
      shotMeasurementOrder,
      hasBacksights,
      lrudAssociation,
    } = this
    return `${inverseAzimuthUnits[displayAzimuthUnit]}${
      inverseLengthUnits[displayLengthUnit]
    }${inverseLengthUnits[displayLrudUnit]}${
      inverseInclinationUnits[displayInclinationUnit]
    }${lrudOrder
      .map(i => inverseLrudItems[i])
      .join('')}${shotMeasurementOrder
      .map(i => inverseShotMeasurementItems[i])
      .join('')}${hasBacksights ? 'B' : 'N'}${
      lrudAssociation != null ? inverseStationSides[lrudAssociation] : ''
    }`
  }

  toString(): string {
    const {
      caveName,
      surveyName,
      date,
      comment,
      surveyors,
      rawSurveyors,
      declination,
      lengthCorrection,
      frontsightAzimuthCorrection,
      frontsightInclinationCorrection,
      backsightAzimuthCorrection,
      backsightInclinationCorrection,
    } = this
    return `${caveName || '?'}
SURVEY NAME: ${surveyName || '?'}
SURVEY DATE: ${date.getMonth() +
      1} ${date.getDate()} ${date.getFullYear()}  COMMENT:${comment || ''}
SURVEY TEAM:
${formatSurveyors(rawSurveyors, surveyors)}
DECLINATION: ${formatNumber(declination).padStart(
      7
    )}  FORMAT: ${this._formatFormat()}  CORRECTIONS: ${formatNumber(
      frontsightAzimuthCorrection
    )} ${formatNumber(frontsightInclinationCorrection)} ${formatNumber(
      lengthCorrection
    )}${
      backsightAzimuthCorrection != null &&
      backsightInclinationCorrection != null
        ? `  CORRECTIONS2: ${formatNumber(
            backsightAzimuthCorrection
          )} ${formatNumber(backsightInclinationCorrection)}`
        : ''
    }
`
  }
}

function formatNumber(
  value: number | UnitizedNumber<Length> | UnitizedNumber<Angle>
): string {
  if (value instanceof UnitizedNumber) {
    switch (value.unit.type) {
      case Length.type:
        return formatNumber((value: any).get(Length.feet))
      case Angle.type:
        return formatNumber((value: any).get(Angle.degrees))
      default:
        throw new Error(`invalid unit type: ${String(value.unit.type)}`)
    }
  } else if (typeof value === 'number') {
    return value.toFixed(2)
  } else {
    throw new Error(`invalid value: ${value}`)
  }
}

function formatSurveyors(
  rawSurveyors: ?string,
  surveyors: ?Array<string>
): string {
  if (rawSurveyors) return rawSurveyors
  if (surveyors && surveyors.length) {
    if (surveyors.findIndex(s => s.includes(',')) >= 0) {
      return surveyors.join(';')
    }
    return surveyors.join(',')
  }
  return '?'
}
