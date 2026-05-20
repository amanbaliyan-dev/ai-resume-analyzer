import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const name   = searchParams.get('name')  || 'Candidate';
  const score  = searchParams.get('score') || '0';
  const role   = searchParams.get('role')  || 'Software Engineer';
  const badge  = searchParams.get('badge') || 'DSA Beast';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0f0f23',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 22, color: '#7F77DD', fontWeight: 600, marginBottom: 24, display: 'flex' }}>
          ApexPrep AI
        </div>

        {/* Score ring (simulated with border) */}
        <div style={{
          width: 160, height: 160, borderRadius: '50%',
          border: '6px solid #7F77DD',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
        }}>
          <span style={{ fontSize: 52, fontWeight: 700, color: '#fff' }}>{score}</span>
          <span style={{ fontSize: 14, color: '#9f9fc0' }}>/ 100</span>
        </div>

        {/* Name + Role */}
        <div style={{ fontSize: 38, fontWeight: 700, color: '#fff', marginBottom: 8, display: 'flex' }}>{name}</div>
        <div style={{ fontSize: 20, color: '#9f9fc0', marginBottom: 28, display: 'flex' }}>{role}</div>

        {/* Badge pill */}
        <div style={{
          background: '#26215C', border: '1.5px solid #534AB7',
          borderRadius: 32, padding: '10px 28px',
          fontSize: 18, color: '#AFA9EC', fontWeight: 500,
          display: 'flex',
        }}>
          {badge}
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 36, fontSize: 14, color: '#5a5a80', display: 'flex' }}>
          apexprep.ai/profile/{searchParams.get('uid') || 'user'}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
