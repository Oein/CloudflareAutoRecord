import axios_ from "axios";
import "dotenv/config";

const axios = axios_.create({
  baseURL: "https://api.cloudflare.com/client/v4",
  headers: {
    Authorization: "Bearer " + process.env.TOKEN,
  },
});

let ipAdress = "0.0.0.0";

async function myIP() {
  let ipres = await axios_("https://api.myip.com/");
  return ipres.data.ip;
}

async function editRecord(zoneID: string, recordID: string, name: string) {
  let res = await axios.put(`/zones/${zoneID}/dns_records/${recordID}`, {
    content: ipAdress,
    name: name,
    type: process.env.RECORD_TYPE,
  });
  console.log(
    `<Record\n\tzoneID="${zoneID}"\n\trecordID="${recordID}"\n\tadress="${ipAdress}"\n\tsuccess="${res.data.success}"\n/>`
  );
}

async function editZone(zone: { id: string; name: string }) {
  let dnsRecords = await axios.get(
    `/zones/${zone.id}/dns_records?type=${process.env.RECORD_TYPE}`
  );
  let editingRecords = dnsRecords.data.result.filter(
    (record: { name: string }) => record.name == process.env.FULL_DOMAIN
  );
  for (let i = 0; i < editingRecords.length; i++)
    await editRecord(zone.id, editingRecords[i].id, editingRecords[i].name);
}

async function main() {
  ipAdress = await myIP();

  let zoneList = await axios.get("/zones");
  let editingZone = zoneList.data.result.filter(
    (j: { name: string; permissions: string[] }) =>
      j.name == process.env.DOMAIN &&
      j.permissions.includes("#dns_records:edit")
  );
  for (let i = 0; i < editingZone.length; i++) await editZone(editingZone[i]);
}

main();
