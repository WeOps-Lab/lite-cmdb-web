"use client";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function AssetDetail() {
  const searchParams = useSearchParams().toString();
  redirect(`/assetManage/detail/attributes?${searchParams}`);
  return null;
}
