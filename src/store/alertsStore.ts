import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PriceAlert {
  id: string
  destinationId: string
  city: string
  country: string
  fareUsd: number
  outboundDate: string
  returnDate: string
  stops: number
  addedAt: string
}

interface AlertsState {
  alerts: PriceAlert[]
  addAlert: (data: Omit<PriceAlert, 'id' | 'addedAt'>) => void
  removeAlert: (id: string) => void
  hasAlert: (destinationId: string) => boolean
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (data) =>
        set((state) => ({
          alerts: [
            ...state.alerts.filter((a) => a.destinationId !== data.destinationId), // replace if exists
            {
              ...data,
              id: crypto.randomUUID(),
              addedAt: new Date().toISOString(),
            },
          ],
        })),

      removeAlert: (id) =>
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

      hasAlert: (destinationId) =>
        get().alerts.some((a) => a.destinationId === destinationId),
    }),
    { name: 'united-price-alerts' }
  )
)
