"use client";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function AssetDetail() {
  const searchParams = useSearchParams();
  const objIcon = searchParams.get("bk_obj_icon");
  const modelName = searchParams.get("bk_obj_name");
  const modelId = searchParams.get("bk_obj_id");
  const classificationId = searchParams.get("classification_id");
  redirect(
    `/assetManage/detail/attributes?bk_obj_icon=${objIcon}&bk_obj_name=${modelName}&bk_obj_id=${modelId}&classification_id=${classificationId}`
  );
  return null;
}
