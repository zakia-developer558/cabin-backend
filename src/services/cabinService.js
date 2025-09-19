import Cabin from '../models/Cabin.js';
import Counter from '../models/Counter.js';

const generateSlug = (name) => {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const createCabin = async (payload, ownerUser) => {
  try {
    const baseSlug = generateSlug(payload.name);
    let slug = baseSlug;
    let suffix = 1;

    // ensure unique slug
    while (await Cabin.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const nextId = await Counter.getNextSequence('cabin_id');

    const cabin = await Cabin.create({
      id: nextId,
      owner: ownerUser.userId,
      name: payload.name,
      slug,
      address: payload.address,
      postal_code: payload.postal_code,
      city: payload.city,
      phone: payload.phone,
      email: payload.email,
      contact_person_name: payload.contact_person_name,
      contact_person_employer: payload.contact_person_employer,
      is_member: payload.is_member ?? false
    });

    return cabin;
  } catch (error) {
    throw error;
  }
};

export const listCabins = async ({ city, is_member, ownerId, limit = 20, page = 1 }) => {
  const filter = {};
  if (city) filter.city = city;
  if (typeof is_member === 'boolean') filter.is_member = is_member;
  if (ownerId) filter.owner = ownerId;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Cabin.find(filter, { sort: { createdAt: -1 }, skip, limit: Number(limit) }),
    Cabin.countDocuments(filter)
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

export const getCabinBySlug = async (slug) => {
  const cabin = await Cabin.findOne({ slug });
  if (!cabin) throw new Error('Cabin not found');
  return cabin;
};

export const updateCabin = async (slug, updates, ownerUser) => {
  const cabin = await Cabin.findOne({ slug });
  if (!cabin) throw new Error('Cabin not found');
  if (String(cabin.owner) !== String(ownerUser.userId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  // Regenerate slug if name changes
  if (updates.name && updates.name !== cabin.name) {
    const baseSlug = generateSlug(updates.name);
    let newSlug = baseSlug;
    let suffix = 1;
    while (await Cabin.findOne({ slug: newSlug, _id: { $ne: cabin._id } })) {
      newSlug = `${baseSlug}-${suffix++}`;
    }
    cabin.slug = newSlug;
    cabin.name = updates.name;
  }

  await Cabin.findByIdAndUpdate(cabin._id, {
    address: updates.address ?? cabin.address,
    postal_code: updates.postal_code ?? cabin.postal_code,
    city: updates.city ?? cabin.city,
    phone: updates.phone ?? cabin.phone,
    email: updates.email ?? cabin.email,
    contact_person_name: updates.contact_person_name ?? cabin.contact_person_name,
    contact_person_employer: updates.contact_person_employer ?? cabin.contact_person_employer,
    is_member: typeof updates.is_member === 'boolean' ? updates.is_member : cabin.is_member,
    slug: cabin.slug,
    name: cabin.name
  });
  
  // Return updated cabin
  return await Cabin.findById(cabin._id);
};

export const deleteCabin = async (slug, ownerUser) => {
  const cabin = await Cabin.findOne({ slug });
  if (!cabin) throw new Error('Cabin not found');
  if (String(cabin.owner) !== String(ownerUser.userId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  await cabin.deleteOne();
  return { message: 'Cabin deleted' };
};

export const getMyCabins = async (ownerId, { limit = 20, page = 1 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Cabin.find({ owner: ownerId }, { sort: { createdAt: -1 }, skip, limit: Number(limit) }),
    Cabin.countDocuments({ owner: ownerId })
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

