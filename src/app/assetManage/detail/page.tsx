"use client";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function AssetDetail() {
  const searchParams = useSearchParams();
  const objIcon = searchParams.get("icn");
  const modelName = searchParams.get("model_name");
  const modelId = searchParams.get("model_id");
  const classificationId = searchParams.get("classification_id");
  redirect(
    `/assetManage/detail/attributes?icn=${objIcon}&model_name=${modelName}&model_id=${modelId}&classification_id=${classificationId}`
  );
  return null;
}
