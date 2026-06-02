import React from 'react'

export default function HomePage() {
  return (
    <div style={{ padding: '3rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center', lineHeight: '1.6' }}>
      <h1>🚀 Fluxdev Blog Backend</h1>
      <p>Tu servidor de Payload CMS está corriendo exitosamente.</p>
      <p style={{ marginTop: '2rem' }}>
        <a href="/admin" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold' }}>
          Ir al Panel de Administración (/admin)
        </a>
      </p>
      <p>
        <a href="/api/docs" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          Ver Documentación de la API (Swagger)
        </a>
      </p>
    </div>
  )
}
