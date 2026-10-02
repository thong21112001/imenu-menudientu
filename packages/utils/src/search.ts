/**
 * Tiện ích hỗ trợ tìm kiếm tiếng Việt & tiếng Anh thông minh
 * Dùng cho cả màn hình POS, Quản trị thực đơn (Admin Menu) và Thực đơn khách hàng (QR)
 */

/**
 * Loại bỏ dấu tiếng Việt (thanh điệu và nguyên âm có dấu)
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  // Xóa các ký tự dấu tổ hợp utf-8
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str;
}

/**
 * Xây dựng biểu thức chính quy (Regex Pattern) bắt trọn vẹn ký tự tiếng Việt có dấu và không dấu
 * Ví dụ: 'pho bo' -> /[p][h][o...]\s+[b][o...]/i
 */
export function buildVietnameseRegex(query: string): RegExp {
  if (!query || !query.trim()) return /.*/i;

  const escapeRegex = (s: string) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

  const charMap: Record<string, string> = {
    a: '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    e: '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    i: '[iìíịỉĩIÌÍỊỈĨ]',
    o: '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    u: '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    y: '[yỳýỵỷỹYỲÝỴỶỸ]',
    d: '[dđDĐ]',
  };

  const clean = query.trim().toLowerCase();
  let pattern = '';

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (charMap[ch]) {
      pattern += charMap[ch];
    } else if (/\s/.test(ch)) {
      pattern += '\\s+';
    } else {
      pattern += escapeRegex(ch);
    }
  }

  return new RegExp(pattern, 'i');
}

/**
 * So khớp từ khóa tìm kiếm (hỗ trợ cả không dấu, có dấu, tiếng Anh và viết tắt)
 */
export function matchVietnameseSearch(targetText: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!targetText) return false;

  const rawTarget = targetText.toLowerCase();
  const rawQuery = query.toLowerCase().trim();

  // Khớp trực tiếp
  if (rawTarget.includes(rawQuery)) return true;

  // Khớp không dấu
  const normTarget = removeVietnameseTones(rawTarget);
  const normQuery = removeVietnameseTones(rawQuery);
  if (normTarget.includes(normQuery)) return true;

  // Khớp bằng Regex tiếng Việt
  try {
    const rx = buildVietnameseRegex(query);
    return rx.test(targetText);
  } catch {
    return false;
  }
}
