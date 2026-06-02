import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket({ onLocation, onAlert } = {}) {
  const onLocationRef = useRef(onLocation)
  const onAlertRef    = useRef(onAlert)
  useEffect(() => { onLocationRef.current = onLocation }, [onLocation])
  useEffect(() => { onAlertRef.current    = onAlert    }, [onAlert])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 4000,
      onConnect: () => {
        client.subscribe('/topic/locations', (msg) => {
          try { onLocationRef.current?.(JSON.parse(msg.body)) } catch {}
        })
        client.subscribe('/topic/alerts', (msg) => {
          try { onAlertRef.current?.(JSON.parse(msg.body)) } catch {}
        })
      },
    })
    client.activate()
    return () => client.deactivate()
  }, [])
}
