// ============================================================
// api.js — Single source of truth for ALL API calls
// ============================================================

const BASE_URL = 'http://localhost:5000/api'; // Change to Render URL for production

const Api = (() => {
  // ── CORE FETCH ──────────────────────────────────────────
  const request = async (method, path, body = null, isFormData = false) => {
    const token = Auth.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const options = { method, headers };
    if (body) options.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const get  = (path)        => request('GET',    path);
  const post = (path, body, fd) => request('POST', path, body, fd);
  const put  = (path, body, fd) => request('PUT',  path, body, fd);
  const patch = (path, body)  => request('PATCH',  path, body);
  const del  = (path)        => request('DELETE', path);

  // ── AUTH ────────────────────────────────────────────────
  const auth = {
    login:          (email, password) => post('/auth/login', { email, password }),
    me:             ()                => get('/auth/me'),
    changePassword: (currentPassword, newPassword) => post('/auth/change-password', { currentPassword, newPassword })
  };

  // ── SUBMISSIONS ─────────────────────────────────────────
  const submissions = {
    create: (formData)   => post('/submissions', formData, true),
    mine:   (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/submissions/mine${q ? '?' + q : ''}`);
    },
    getOne:  (id)         => get(`/submissions/${id}`),
    update:  (id, fd)     => request('PATCH', `/submissions/${id}`, fd, true),
    delete:  (id)         => del(`/submissions/${id}`)
  };

  // ── REVIEW (Principal) ───────────────────────────────────
  const review = {
    pending:  (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/review/pending${q ? '?' + q : ''}`);
    },
    approved: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/review/approved${q ? '?' + q : ''}`);
    },
    all:      (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/review/all${q ? '?' + q : ''}`);
    },
    approve:  (id)          => patch(`/review/${id}/approve`),
    reject:   (id, comment) => patch(`/review/${id}/reject`, { comment }),
    stats:    ()            => get('/review/stats')
  };

  // ── VOLUMES ──────────────────────────────────────────────
  const volumes = {
    list:       ()               => get('/volumes'),
    get:        (id)             => get(`/volumes/${id}`),
    create:     (data)           => post('/volumes', data),
    add:        (id, ids)        => patch(`/volumes/${id}/add`, { submission_ids: ids }),
    remove:     (id, subId)      => patch(`/volumes/${id}/remove`, { submission_id: subId }),
    setMessage: (id, msg)        => patch(`/volumes/${id}/message`, { principal_message: msg }),
    publish:    (id)             => patch(`/volumes/${id}/publish`),
    unpublish:  (id)             => patch(`/volumes/${id}/unpublish`),
    render:     (id)             => get(`/volumes/${id}/render`)
  };

  // ── ADMIN ────────────────────────────────────────────────
  const admin = {
    getCollegeInfo:     ()       => get('/admin/college-info'),
    updateCollegeInfo:  (data)   => put('/admin/college-info', data),
    uploadLogo:         (fd)     => post('/admin/college-info/logo', fd, true),
    uploadPrincipalPhoto: (fd)   => post('/admin/college-info/principal-photo', fd, true),
    getDepts:           ()       => get('/admin/departments'),
    createDept:         (data)   => post('/admin/departments', data),
    updateDept:         (id, d)  => patch(`/admin/departments/${id}`, d),
    getUsers:           ()       => get('/admin/users'),
    createUser:         (data)   => post('/admin/users', data),
    updateUser:         (id, d)  => patch(`/admin/users/${id}`, d),
    deleteUser:         (id)     => del(`/admin/users/${id}`)
  };

  return { auth, submissions, review, volumes, admin };
})();
