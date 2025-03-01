import {
    DeleteAllDataUseCase,
    TestingController
} from "../../modules/testing/application/use-cases/delete-all-data.use-case";
import {
    blogsCommandRepository,
    postsCommandRepository,
    tokenCommandRepository,
    usersCommandRepository
} from "./repositories";

export const deleteAllDataUseCase = new DeleteAllDataUseCase(
    blogsCommandRepository,
    postsCommandRepository,
    usersCommandRepository,
    tokenCommandRepository,
);

export const testingController = new TestingController(
    deleteAllDataUseCase
);