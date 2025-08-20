
/**
 * Helper para montar a rota do ProfileView do app
 * Baseado na análise das rotas do projeto: /profile/:userId
 */
export const buildProfileRoute = (userId: string) => `/profile/${userId}`