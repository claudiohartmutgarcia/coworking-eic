import type { APIRoute, GetStaticPaths } from "astro";
import { alleVeranstaltungen, ics, type Veranstaltung } from "../../../lib/termine";
import { url } from "../../../lib/url";

export const getStaticPaths: GetStaticPaths = async () => {
  const alle = await alleVeranstaltungen();
  return alle.map((v) => ({ params: { slug: v.id }, props: { v } }));
};

export const GET: APIRoute = ({ props, site }) => {
  const v = props.v as Veranstaltung;
  const seite = new URL(url(`/veranstaltungen/${v.id}`), site).href;
  return new Response(ics(v, seite), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
};
