import { Request, Response, Router } from "express";
import { cacheMiddleware } from "../../middleware/cacheMiddleware";
import { updateRoundSummaryHandler } from "../../handlers/updateRoundSummaryHandler";
import { updateProjectSummaryHandler } from "../../handlers/updateProjectSummaryHandler";
import { getProjectSummaryDataHandler } from "../../handlers/getProjectSummaryDataHandler";
import { getRoundSummaryDataHandler } from "../../handlers/getRoundSummaryDataHandler";
import { updateRoundMatchHandler } from "../../handlers/updateRoundMatchHandler";
import { getProjectMatchDataHandler } from "../../handlers/getProjectMatchDataHandler";
import { getRoundMatchDataHandler } from "../../handlers/getRoundMatchDataHandler";
import { getProjectSummariesDataHandler } from "../../handlers/getProjectSummariesDataHandler";
import { getProjectMatchDataByProjectIdsHandler } from "../../handlers/getProjectMatchDataByProjectIdsHandler";
import { getMatchAmountPreviewHandler } from "../../handlers/getMatchAmountPreviewHandler";
import { getTipIncludedHandler } from "../../handlers/getVoteIncludedHandler";

const router = Router();

if (process.env.NODE_ENV === "production") {
  router.use(cacheMiddleware);
}

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

// <--- SUMMARY ROUTES --->
router.post(
  "/update/summary/round/:chainId/:roundId",
  updateRoundSummaryHandler
);
router.post(
  "/update/summary/project/:chainId/:roundId/:projectId",
  updateProjectSummaryHandler
);
router.get(
  "/data/summary/project/:chainId/:roundId/:projectId",
  getProjectSummaryDataHandler
);
router.get("/data/summary/round/:chainId/:roundId", getRoundSummaryDataHandler);
router.get(
  "/data/summary/projects/:chainId/:roundId",
  getProjectSummariesDataHandler
);

// <--- MATCH ROUTES --->
router.post("/update/match/round/:chainId/:roundId", updateRoundMatchHandler);
router.get(
  "/data/match/project/:chainId/:roundId/:projectId",
  getProjectMatchDataHandler
);
router.get(
  "/data/match/preview/:chainId/:roundId/:projectId",
  getMatchAmountPreviewHandler
);
router.post("/data/match/tip-included/:chainId", getTipIncludedHandler);

router.get(
  "/data/match/round/projectIds/:chainId/:roundId",
  getProjectMatchDataByProjectIdsHandler
);
router.get("/data/match/round/:chainId/:roundId", getRoundMatchDataHandler);

export default router;
