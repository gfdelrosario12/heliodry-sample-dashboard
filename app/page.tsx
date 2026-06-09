'use client'

import { useState, useEffect } from 'react'
import { Thermometer, Droplets, Play, Square, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'

export default function Page() {
  // State management
  const [isOnline, setIsOnline] = useState(true)
  const [isDrying, setIsDrying] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState('palay')
  const [targetTemp, setTargetTemp] = useState(50)
  const [maxFanSpeed, setMaxFanSpeed] = useState(false)

  // Interactive simulation state for presentation
  const [currentMoisture, setCurrentMoisture] = useState(18.5)
  const [currentTemp, setCurrentTemp] = useState(32.2)
  const [currentHumidity, setCurrentHumidity] = useState(65)
  const [offlineRecords, setOfflineRecords] = useState(1240)
  const [syncProgress, setSyncProgress] = useState(65)

  // Targets & Limits
  const targetMoisture = selectedCrop === 'palay' ? 14.0 : 13.0
  const isCriticalTemp = currentTemp > 55
  const heaterOn = isDrying && currentTemp < targetTemp + 0.5
  const fanOn = maxFanSpeed || isDrying || currentTemp > 35.0

  // Simulation Effect for Drying Process
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isDrying) {
      interval = setInterval(() => {
        setCurrentTemp(prev => {
          if (prev < targetTemp) return +(prev + 0.8).toFixed(1)
          if (prev > targetTemp + 1) return +(prev - 0.4).toFixed(1)
          return +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1)
        })
        setCurrentMoisture(prev => (prev > targetMoisture ? +(prev - 0.1).toFixed(1) : prev))
        setCurrentHumidity(prev => (prev > 30 ? Math.max(30, prev - 1) : prev))
      }, 1000)
    } else {
      interval = setInterval(() => {
        setCurrentTemp(prev => (prev > 32.2 ? +(prev - 0.5).toFixed(1) : 32.2))
        setCurrentHumidity(prev => (prev < 65 ? prev + 1 : 65))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isDrying, targetTemp, targetMoisture])

  // Simulation Effect for Offline Data Buffering
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (!isOnline) {
      interval = setInterval(() => {
        setOfflineRecords(prev => prev + Math.floor(Math.random() * 3) + 1)
        setSyncProgress(prev => (prev < 90 ? prev + 1 : 90))
      }, 2000)
    } else {
      setSyncProgress(100)
    }
    return () => clearInterval(interval)
  }, [isOnline])

  // Progress Ring Math (Filling up as it dries)
  const circumference = 2 * Math.PI * 90
  const moistureProgressRatio = Math.max(0, Math.min(1, (25 - currentMoisture) / (25 - targetMoisture)))
  const strokeDashoffset = circumference * (1 - moistureProgressRatio)

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Mobile-sized container with phone-like appearance */}
      <div className="mx-auto max-w-md space-y-4 rounded-2xl bg-background shadow-xl">
        {/* Top Navigation */}
        <div className="border-b border-border px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-foreground">HelioDry</h1>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <Badge 
                variant={isOnline ? "default" : "secondary"}
                className={isOnline ? "bg-green-600" : "bg-orange-500"}
              >
                {isOnline ? "🟢 AWS Cloud" : "🟠 Local Direct"}
              </Badge>
            </button>
          </div>
        </div>

        {/* Hero Section - Moisture Content */}
        <div className="px-4">
          <Card className="p-6">
            {/* Status Indicator */}
            <div className="mb-6 flex items-center gap-2">
              {isDrying ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-600">Status: Active Drying</span>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium text-muted-foreground">Status: Idle</span>
                </>
              )}
            </div>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${strokeDashoffset}`}
                    className="text-blue-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{currentMoisture.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground mt-1">Grain Moisture</span>
                </div>
              </div>
            </div>

            {/* Target text */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Target: {targetMoisture.toFixed(1)}%</p>
            </div>
          </Card>
        </div>

        {/* Environmental Sensors */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature Card */}
            <Card className={`p-4 transition-colors ${isCriticalTemp ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}`}>
              <div className="flex flex-col items-center text-center">
                <Thermometer className={`h-6 w-6 mb-2 ${isCriticalTemp ? 'text-red-600' : 'text-foreground'}`} />
                <p className={`text-2xl font-bold ${isCriticalTemp ? 'text-red-600' : 'text-foreground'}`}>
                  {currentTemp.toFixed(1)}°C
                </p>
                <p className="text-xs text-muted-foreground mt-2">Target: {targetTemp.toFixed(0)}°C</p>
              </div>
            </Card>

            {/* Humidity Card */}
            <Card className="p-4">
              <div className="flex flex-col items-center text-center">
                <Droplets className="h-6 w-6 mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-foreground">{currentHumidity}%</p>
                <p className="text-xs text-muted-foreground mt-2">Rel. Humidity</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Control Panel */}
        <div className="px-4 space-y-4">
          {/* Crop Selector */}
          <Card className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Crop Type</p>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedCrop('palay')}
                variant={selectedCrop === 'palay' ? 'default' : 'outline'}
                disabled={isDrying}
                className="flex-1"
              >
                Palay
              </Button>
              <Button
                onClick={() => setSelectedCrop('corn')}
                variant={selectedCrop === 'corn' ? 'default' : 'outline'}
                disabled={isDrying}
                className="flex-1"
              >
                Corn
              </Button>
            </div>
          </Card>

          {/* Master Power Button */}
          <Button
            onClick={() => setIsDrying(!isDrying)}
            className={`w-full h-16 text-lg font-semibold gap-2 ${
              isDrying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isDrying ? (
              <>
                <Square className="h-5 w-5" />
                Stop Drying
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Drying
              </>
            )}
          </Button>

          {/* Manual Overrides Accordion */}
          <Accordion className="w-full">
            <AccordionItem value="manual-overrides">
              <AccordionTrigger className="text-sm font-semibold">
                Manual Overrides (PID Settings)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Target Temperature Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Target Temperature</label>
                    <span className="text-sm font-semibold text-blue-600">{targetTemp.toFixed(0)}°C</span>
                  </div>
                  <Slider
                    min={40}
                    max={55}
                    step={1}
                    value={[targetTemp]}
                    onValueChange={(value) => setTargetTemp(typeof value === 'number' ? value : value[0])}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Range: 40°C - 55°C</p>
                </div>

                {/* Max Fan Speed Override */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <label className="text-sm font-medium">Max Fan Speed Override</label>
                  <Switch
                    checked={maxFanSpeed}
                    onCheckedChange={setMaxFanSpeed}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Hardware & Edge Buffer Status Footer */}
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Hardware Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`text-sm font-medium p-3 rounded-lg ${heaterOn ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-muted text-muted-foreground'}`}>
              🔥 Heater: {heaterOn ? 'ON' : 'OFF'}
            </div>
            <div className={`text-sm font-medium p-3 rounded-lg ${fanOn ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300' : 'bg-muted text-muted-foreground'}`}>
              🌀 Fan: {fanOn ? 'ON' : 'OFF'}
            </div>
          </div>

          {/* Sync Status */}
          {!isOnline ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Buffering locally...</p>
                  <p className="text-xs text-muted-foreground">{offlineRecords.toLocaleString()} records saved</p>
                </div>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-foreground font-medium">All data synced to database</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
