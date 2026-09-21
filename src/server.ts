import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };
import { prisma } from './prisma/db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
// Rota visual do Swagger para documentação
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// Rota inicial de teste
app.get('/', (req, res) => {
    res.json({ mensagem: "API DevShowcase Avançada rodando localmente!" });
});

/* ==========================================================================
   ENDPOINTS EXISTENTES (ATUALIZADOS)
   ========================================================================== */

/* ==========================================================================
   PROFILES
   ========================================================================== */

// Cadastrar perfil
app.post('/api/profiles', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, githubUrl, linkedinUrl } = req.body;

        if (!name || !bio || !githubUrl || !linkedinUrl) {
            return res.status(400).json({
                erro: "Todos os campos do perfil são obrigatórios!"
            });
        }

        const newProfile = await prisma.profile.create({
            data: {
                name,
                bio,
                githubUrl,
                linkedinUrl
            }
        });

        return res.status(201).json(newProfile);

    } catch (error) {
        next(error);
    }
});

// Buscar perfil pelo ID
app.get('/api/profiles/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const profile = await prisma.profile.findUnique({
            where: { id }
        });

        if (!profile) {
            return res.status(404).json({
                erro: "Perfil não encontrado!"
            });
        }

        return res.json(profile);

    } catch (error) {
        next(error);
    }
});
/* ==========================================================================
   TECHNOLOGIES
   ========================================================================== */

// Cadastrar tecnologia
app.post('/api/technologies', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                erro: "O nome da tecnologia é obrigatório!"
            });
        }

        const existingTechnology = await prisma.technology.findUnique({
            where: {
                name: name.trim()
            }
        });

        if (existingTechnology) {
            return res.status(400).json({
                erro: "Essa tecnologia já está cadastrada!"
            });
        }

        const newTechnology = await prisma.technology.create({
            data: {
                name: name.trim()
            }
        });

        return res.status(201).json(newTechnology);

    } catch (error) {
        next(error);
    }
});

// Listar todas as tecnologias
app.get('/api/technologies', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const technologies = await prisma.technology.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return res.json(technologies);

    } catch (error) {
        next(error);
    }
});
/* ==========================================================================
   NOVO REQUISITO: GET /api/projects (Filtro por tecnologia e Paginação)
   ========================================================================== */
app.get('/api/projects', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const techFilter = req.query.tech as string | undefined;
        const page = Math.max(parseInt(req.query.page as string) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit as string) || 2, 1);

        const where = techFilter
            ? {
                technology: {
                    equals: techFilter,
                    mode: 'insensitive' as const
                }
            }
            : {};

        const [projects, totalItems] = await Promise.all([
            prisma.project.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit
            }),

            prisma.project.count({
                where
            })
        ]);

        return res.json({
            page,
            limit,
            totalItems,
            data: projects
        });

    } catch (error) {
        next(error);
    }
});

// Rota auxiliar para cadastrar projetos rapidamente nos testes com os novos campos
app.post('/api/projects', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, repositoryUrl, profileId, technology } = req.body;

        if (!title || !description || !repositoryUrl || !profileId || !technology) {
            return res.status(400).json({
                erro: "Todos os campos do projeto são obrigatórios!"
            });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: profileId }
        });

        if (!profile) {
            return res.status(404).json({
                erro: "Perfil informado não foi encontrado!"
            });
        }
const existingTechnology = await prisma.technology.findUnique({
    where: {
        name: technology
    }
});

if (!existingTechnology) {
    return res.status(404).json({
        erro: "Tecnologia informada não foi encontrada!"
    });
}
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                repositoryUrl,
                profileId,
                technology,
                upvotes: 0,
                averageRating: 0
            }
        });

        return res.status(201).json(newProject);

    } catch (error) {
        next(error);
    }
});

/* ==========================================================================
   NOVO REQUISITO: PUT /api/projects/{id}/upvote (Incrementar curtidas)
   ========================================================================== */
app.put('/api/projects/:id/upvote', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({
                erro: "Projeto não encontrado para receber upvote!"
            });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                upvotes: {
                    increment: 1
                }
            }
        });

        res.json({
            mensagem: "Upvote computado com sucesso!",
            upvotes: updatedProject.upvotes
        });
    } catch (error) {
        next(error);
    }
});

/* ==========================================================================
   NOVO REQUISITO: POST /api/projects/{id}/feedbacks (Nota de 1 a 5 e Média)
   ========================================================================== */
app.post('/api/projects/:id/feedbacks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { comment, rating } = req.body;

        // Validação dos dados
        if (
            typeof comment !== 'string' ||
            !comment.trim() ||
            typeof rating !== 'number' ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                erro: "O comentário é obrigatório e a nota deve ser um número inteiro entre 1 e 5!"
            });
        }

        // Verifica se o projeto existe
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({
                erro: "Projeto não encontrado para receber feedback!"
            });
        }

        // Salva o feedback no PostgreSQL
        const newFeedback = await prisma.feedback.create({
            data: {
                comment: comment.trim(),
                rating,
                projectId: id
            }
        });

        // Calcula a nova média das avaliações
        const ratings = await prisma.feedback.aggregate({
            where: {
                projectId: id
            },
            _avg: {
                rating: true
            }
        });

        const newAverage = ratings._avg.rating ?? 0;

        // Atualiza a média no projeto
        await prisma.project.update({
            where: { id },
            data: {
                averageRating: newAverage
            }
        });

        return res.status(201).json({
            mensagem: "Feedback adicionado!",
            feedback: newFeedback,
            novaMediaProjeto: newAverage
        });
    } catch (error) {
        next(error);
    }
});
app.get('/api/projects/:id/feedbacks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Verifica se o projeto existe
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({
                erro: "Projeto não encontrado!"
            });
        }

        // Busca os feedbacks do projeto no PostgreSQL
        const projectFeedbacks = await prisma.feedback.findMany({
            where: {
                projectId: id
            }
        });

        return res.json({
            projectId: id,
            totalFeedbacks: projectFeedbacks.length,
            feedbacks: projectFeedbacks
        });
    } catch (error) {
        next(error);
    }
});
/* ==========================================================================
   REQUISITO: TRATAMENTO GLOBAL DE EXCEÇÕES (MIDDLEWARE DE ERRO)
   ========================================================================== */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Erro interno detectado:", err);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor. Tente novamente mais tarde." });
});

// Rota genérica para capturar qualquer link errado (Garante Erro 404 amigável pedido pelo professor)
app.use((req: Request, res: Response) => {
    res.status(404).json({ erro: "Rota não encontrada! Verifique o endereço digitado." });
});

// Liga o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor robusto rodando em http://localhost:${PORT}`);
});
