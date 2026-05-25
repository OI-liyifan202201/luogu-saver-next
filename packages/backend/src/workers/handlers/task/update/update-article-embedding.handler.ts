import { UpdateTask } from '@/shared/task';
import { ChildrenValues, TaskCommonResult, TaskHandler, WorkflowResult } from '@/workers/types';
import { Job } from 'bullmq';
import { extractUpsteamData, shouldSkip } from '@/workers/helpers/common.helper';
import { EmbeddingService } from '@/services/embedding.service';
import { ArticleService } from '@/services/article.service';

export class UpdateArticleEmbeddingHandler implements TaskHandler<UpdateTask> {
    public taskType = 'update:article_embedding';

    public async handle(
        task: UpdateTask,
        job: Job<UpdateTask>
    ): Promise<WorkflowResult<TaskCommonResult>> {
        const childrenValues = (await job.getChildrenValues()) as ChildrenValues;

        if (shouldSkip(childrenValues)) {
            return {
                skipNextStep: true,
                data: {}
            };
        }

        const article = await ArticleService.getArticleByIdWithoutCache(task.payload.targetId);
        if (article) {
            const upstreamSummary = extractUpsteamData(
                childrenValues,
                data => typeof data.summary === 'string' && data.summary.trim().length > 0,
                job.id
            )?.summary;
            await EmbeddingService.upsertArticleEmbeddings(article, upstreamSummary);
        }

        return {
            skipNextStep: false,
            data: {
                articleId: task.payload.targetId
            }
        };
    }
}
