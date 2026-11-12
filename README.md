# Ghost — Experimento 001

Primeiro protótipo PWA do Ghost. Aplicação independente inspirada no aprendizado do Mirror.

## O que já funciona
- Painel diário com referência de 1.000 segundos.
- Registro de momentos com duração, universo, intenção, energia, presença e reflexão.
- Linha do tempo com exclusão de registros.
- Indicadores básicos de observação.
- Persistência local no navegador via `localStorage`.
- Exportação dos registros em JSON.
- Manifesto e service worker para instalação/uso offline quando servido por HTTPS.

## Como testar
Abra `index.html` no navegador para testar as funções básicas. Para validar instalação PWA e funcionamento offline, publique a pasta em um host HTTPS estático (por exemplo, GitHub Pages) ou use um servidor local.

## Instalação no iPhone
Depois de hospedar em HTTPS, abra o endereço no Safari, toque em Compartilhar e escolha **Adicionar à Tela de Início**.

## Privacidade e limites desta versão
Os registros ficam no armazenamento local do navegador deste dispositivo. Limpar os dados do navegador pode apagá-los. Use **Exportar meus registros (JSON)** para fazer cópias de segurança. Não há conta, sincronização ou recuperação automática entre dispositivos.

## Próximas decisões
1. Validar fluxo de registro e linguagem do produto.
2. Confirmar se os campos do Mirror devem ser mantidos, renomeados ou simplificados.
3. Definir estratégia de backup/sincronização.
4. Testar instalação PWA em iOS e Android.
