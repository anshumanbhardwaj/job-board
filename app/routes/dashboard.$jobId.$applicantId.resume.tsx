import { LoaderFunctionArgs, redirectDocument } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { db } from "~/db.server";
import { jobApplicationsTable } from "~/db.server/schema";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  credentials: {
    accessKeyId: String(process.env.MINIO_ACCESS_KEY),
    secretAccessKey: String(process.env.MINIO_SECRET_KEY),
  },
  region: "us-east-1",
  endpoint: String(process.env.MINIO_ENDPOINT),
  forcePathStyle: true,
});

export async function loader(args: LoaderFunctionArgs) {
  try {
    const { jobId, applicantId } = args.params;

    const application = await db
      .select()
      .from(jobApplicationsTable)
      .where(
        and(
          eq(jobApplicationsTable.id, String(applicantId)),
          eq(jobApplicationsTable.jobId, String(jobId))
        )
      )
      .limit(1);

    if (application.length === 0) {
      throw new Response("Job or application not found", { status: 404 });
    }

    const fileKey = `${jobId}/${application[0].id}.pdf`;

    const params = {
      Bucket: process.env.MINIO_BUCKET!,
      Key: fileKey,
      ContentType: "application/pdf",
    };

    const command = new GetObjectCommand(params);

    const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

    return redirectDocument(url);
  } catch (error) {
    console.log({ error });
    return new Response(String(error), { status: 500 });
  }
}
