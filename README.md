Neon Souls (Next.js + React Three Fiber)

Como executar (Windows / PowerShell):
- npm install
- npm run dev
- Abra http://localhost:3000

Controles:
- W A S D mover
- Espaço pular
- Clique do mouse atacar

Estrutura:
- app/: Next.js (app router). A página carrega um overlay com botão Iniciar e o Canvas 3D.
- src/game/: Componentes do jogo (Game, Player, Enemies).
- Tailwind para UI do overlay.

Notas:
- Primeiro build pode demorar ao baixar dependências.
- Se aparecer erro de @tailwind/@apply no CSS, é normal enquanto o dev server não está rodando (PostCSS/Tailwind processa).
