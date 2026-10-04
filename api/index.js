export default async function handler(req, res) {
  // CORS Enable
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const sendFormattedJson = (statusCode, data) => {
    return res.status(statusCode).send(JSON.stringify(data, null, 2));
  };

  const { number } = req.query;

  // Agar number blank ho
  if (!number) {
    return sendFormattedJson(400, {
      success: false,
      message: "Number required",
      example: "/api?number=9876543210",
      developer: "GAURAV BHAI KA AURA",
      telegram: "@KALYAN_XD"
    });
  }

  try {
    const apiUrl = `https://rahulkd-num-to-info.vercel.app/api/?number=${number}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // 🚀 SMART FINDER LOGIC: API ka format badle toh bhi ye automatically dhoondh lega
    let records = [];
    const findArray = (obj) => {
      if (Array.isArray(obj)) return obj; // Agar array mil jaye, toh yahi records hain
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          let found = findArray(obj[key]);
          if (found && found.length > 0) return found;
        }
      }
      return null;
    };

    // Auto-scan karke saare records nikal lena
    records = findArray(data) || [];

    if (records.length > 0) {
      const getValidValue = (val) => {
        if (val === null || val === undefined || String(val).trim() === "") {
          return "null"; 
        }
        return String(val).trim();
      };

      // Shuruwat ka response format
      const finalResponse = {
        success: true,
        message: "Records found successfully",
        total_records: records.length 
      };

      // Loop lagakar SARE records ko record_1, record_2 banana
      records.forEach((item, index) => {
        const rawAddress = item.address || "";
        const parts = rawAddress.split('!').map(p => p.trim()).filter(Boolean);

        finalResponse[`record_${index + 1}`] = {
          number: getValidValue(item.num) !== "null" ? getValidValue(item.num) : number,
          name: getValidValue(item.name),
          father_name: getValidValue(item.fname),
          alt_number: getValidValue(item.alt),
          aadhar: getValidValue(item.aadhar), 
          email: getValidValue(item.email),   
          circle: getValidValue(item.circle),
          state: parts.length > 1 ? parts[parts.length - 2] : "null",
          district: parts.length > 2 ? parts[parts.length - 3] : "null",
          "village/city": parts.length > 4 ? parts[1] : "null",
          landmark: parts.length > 4 ? parts[2] : "null",
          pincode: parts.length > 0 ? parts[parts.length - 1] : "null",
          full_address: parts.length > 0 ? parts.join(', ') : "null"
        };
      });

      // Saare records ke baad ekdum LAST me Developer details daalna
      finalResponse.developer = "GAURAV BHAI KA AURA ";
      finalResponse.telegram = "@KALYAN_XD";

      return sendFormattedJson(200, finalResponse);

    } else {
      // Agar sach mein us API ke paas data na ho tabhi ye message aayega
      return sendFormattedJson(404, {
        success: false,
        message: "No record found",
        developer: "GAURAV BHAI NHI NIKELGA DATA ",
        telegram: "@KALYAN_XD"
      });
    }

  } catch (error) {
    return sendFormattedJson(500, {
      success: false,
      message: "Server Error, please try again",
      developer: "GAURAV BHAI KA ERROR",
      telegram: "@KALYAN_XD"
    });
  }
}
