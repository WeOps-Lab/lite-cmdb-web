import { redirect } from 'next/navigation';

export default function AboutPage() {
  redirect('/about/document');
  return null;
}
