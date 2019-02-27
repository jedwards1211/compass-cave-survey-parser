/**
 * @flow
 * @prettier
 */
import { type TripHeader } from './types'
import { Angle, Length, UnitizedNumber } from 'unitized'
import {
  azimuthUnits,
  inclinationUnits,
  lengthUnits,
  lrudItems,
  shotMeasurementItems,
  stationSides,
} from './parseTripHeader'

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

export default function formatTripHeader(header: TripHeader): string {
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
  } = header
  return `${caveName || '?'}
SURVEY NAME: ${surveyName || '?'}
SURVEY DATE: ${date.getMonth() +
    1} ${date.getDate()} ${date.getFullYear()}  COMMENT:${comment || ''}
SURVEY TEAM:
${formatSurveyors(rawSurveyors, surveyors)}
DECLINATION: ${formatNumber(declination).padStart(7)}  FORMAT: ${formatFormat(
    header
  )}  CORRECTIONS: ${formatNumber(frontsightAzimuthCorrection)} ${formatNumber(
    frontsightInclinationCorrection
  )} ${formatNumber(lengthCorrection)}${
    backsightAzimuthCorrection != null && backsightInclinationCorrection != null
      ? `  CORRECTIONS2: ${formatNumber(
          backsightAzimuthCorrection
        )} ${formatNumber(backsightInclinationCorrection)}`
      : ''
  }
`
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

function formatFormat({
  displayAzimuthUnit,
  displayLengthUnit,
  displayLrudUnit,
  displayInclinationUnit,
  lrudOrder,
  shotMeasurementOrder,
  hasBacksights,
  lrudAssociation,
}: TripHeader): string {
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
