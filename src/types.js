// @flow

import { UnitizedNumber, Angle, Length } from 'unitized'

export type DisplayAzimuthUnit = 'degrees' | 'quads' | 'gradians'
export type DisplayInclinationUnit =
  | 'degrees'
  | 'percentGrade'
  | 'degreesAndMinutes'
  | 'gradians'
  | 'depthGauge'
export type DisplayLengthUnit = 'decimalFeet' | 'feetAndInches' | 'meters'

export type StationSide = 'from' | 'to'
export type ShotMeasurementItem =
  | 'length'
  | 'frontsightAzimuth'
  | 'frontsightInclination'
  | 'backsightAzimuth'
  | 'backsightInclination'
export type LrudItem = 'left' | 'right' | 'up' | 'down'

export type TripHeader = {|
  caveName: ?string,
  surveyName: ?string,
  date: Date,
  comment: ?string,
  surveyors: ?Array<string>,
  rawSurveyors: string,
  declination: UnitizedNumber<Angle>,
  displayAzimuthUnit: DisplayAzimuthUnit,
  displayLengthUnit: DisplayLengthUnit,
  displayLrudUnit: DisplayLengthUnit,
  displayInclinationUnit: DisplayInclinationUnit,
  lrudOrder: Array<LrudItem>,
  shotMeasurementOrder: Array<ShotMeasurementItem>,
  hasBacksights: boolean,
  lrudAssociation?: StationSide,
  lengthCorrection: UnitizedNumber<Length>,
  frontsightAzimuthCorrection: UnitizedNumber<Angle>,
  frontsightInclinationCorrection: UnitizedNumber<Angle>,
  backsightAzimuthCorrection?: UnitizedNumber<Angle>,
  backsightInclinationCorrection?: UnitizedNumber<Angle>,
|}

export type Shot = {|
  fromStationName: string,
  toStationName: string,
  length: UnitizedNumber<Length>,
  frontsightAzimuth: ?UnitizedNumber<Angle>,
  frontsightInclination: ?UnitizedNumber<Angle>,
  backsightAzimuth: ?UnitizedNumber<Angle>,
  backsightInclination: ?UnitizedNumber<Angle>,
  left: ?UnitizedNumber<Length>,
  right: ?UnitizedNumber<Length>,
  up: ?UnitizedNumber<Length>,
  down: ?UnitizedNumber<Length>,
  comment?: string,
  excludedFromLength?: boolean,
  excludedFromPlotting?: boolean,
  excludedFromAllProcessing?: boolean,
  doNotAdjust?: boolean,
|}
