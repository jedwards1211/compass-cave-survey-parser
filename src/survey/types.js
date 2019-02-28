// @flow

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
