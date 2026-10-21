import * as base from '../../api/base.api';
import {
  fetchBoatClasses, fetchCrewMembers, createCrewMember, deleteCrewMember,
  fetchBoats, createBoat, deleteBoat,
  fetchCrews, createCrew, updateCrew, updateCrewLineup, deleteCrew,
  fetchRaces, fetchRace, createRace, completeRace, deleteRace,
  recordEntryStart, recordEntryFinish, markEntryDns, markEntryDnf, deleteEntry,
} from '../../api/rowing.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('rowing.api', () => {
  it('fetchBoatClasses gets /rowing/boat-classes', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchBoatClasses();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/rowing/boat-classes'));
  });

  it('fetchCrewMembers gets /rowing/crew', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchCrewMembers();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/rowing/crew'));
  });

  it('createCrewMember posts to /rowing/crew', async () => {
    mockedBase.post.mockResolvedValue({ id: 1 });
    await createCrewMember({ name: 'Alice', gender: 'Women' });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/crew'),
      { name: 'Alice', gender: 'Women' },
    );
  });

  it('deleteCrewMember deletes /rowing/crew/:id', async () => {
    mockedBase.del.mockResolvedValue({ success: true });
    await deleteCrewMember({ id: 1 });
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/rowing/crew/1'));
  });

  it('fetchBoats gets /rowing/boats', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchBoats();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/rowing/boats'));
  });

  it('createBoat posts to /rowing/boats', async () => {
    mockedBase.post.mockResolvedValue({ id: 1 });
    await createBoat({ name: 'Shell A', boatClassId: 2 });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/boats'),
      { name: 'Shell A', boatClassId: 2 },
    );
  });

  it('deleteBoat deletes /rowing/boats/:id', async () => {
    mockedBase.del.mockResolvedValue({ success: true });
    await deleteBoat({ id: 5 });
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/rowing/boats/5'));
  });

  it('fetchCrews gets /rowing/crews', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchCrews();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/rowing/crews'));
  });

  it('createCrew posts to /rowing/crews with seat data', async () => {
    mockedBase.post.mockResolvedValue({ id: 1 });
    const seats = { cox: null, seat1: 1, seat2: 2, seat3: null, seat4: null, seat5: null, seat6: null, seat7: null, seat8: null };
    await createCrew({ boatId: 1, gender: 'Men', ageCategory: 'Open', ...seats });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/crews'),
      expect.objectContaining({ boatId: 1, gender: 'Men', ageCategory: 'Open', seat1: 1, seat2: 2 }),
    );
  });

  it('updateCrew puts to /rowing/crews/:id', async () => {
    mockedBase.put.mockResolvedValue({ id: 1, copied: false });
    const seats = { cox: null, seat1: 1, seat2: null, seat3: null, seat4: null, seat5: null, seat6: null, seat7: null, seat8: null };
    await updateCrew({ id: 1, boatId: 1, gender: 'Women', ageCategory: 'U19', ...seats });
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/crews/1'),
      expect.objectContaining({ gender: 'Women' }),
    );
  });

  it('updateCrewLineup puts to /rowing/crews/:id/lineup', async () => {
    mockedBase.put.mockResolvedValue({ success: true });
    const seats = { cox: null, seat1: 3, seat2: null, seat3: null, seat4: null, seat5: null, seat6: null, seat7: null, seat8: null };
    await updateCrewLineup({ id: 2, boatId: 1, gender: 'Mixed', ageCategory: 'Open', ...seats });
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/crews/2/lineup'),
      expect.objectContaining({ seat1: 3 }),
    );
  });

  it('deleteCrew deletes /rowing/crews/:id', async () => {
    mockedBase.del.mockResolvedValue({ success: true });
    await deleteCrew({ id: 4 });
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/rowing/crews/4'));
  });

  it('fetchRaces gets /rowing/races with date param', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchRaces({ date: '2026-10-21' });
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/races'),
      { date: '2026-10-21' },
    );
  });

  it('fetchRace gets /rowing/races/:id', async () => {
    mockedBase.get.mockResolvedValue({ id: 1 });
    await fetchRace({ id: 1 });
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/rowing/races/1'));
  });

  it('createRace posts to /rowing/races', async () => {
    mockedBase.post.mockResolvedValue({ id: 10 });
    await createRace({ distance: '2000m', raceType: 'time_trial', crewIds: [1, 2] });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/races'),
      expect.objectContaining({ distance: '2000m', raceType: 'time_trial', crewIds: [1, 2] }),
    );
  });

  it('completeRace posts to /rowing/races/:id/complete', async () => {
    mockedBase.post.mockResolvedValue({ success: true });
    await completeRace({ id: 5 });
    expect(mockedBase.post).toHaveBeenCalledWith(expect.stringContaining('/rowing/races/5/complete'));
  });

  it('deleteRace deletes /rowing/races/:id', async () => {
    mockedBase.del.mockResolvedValue({ success: true });
    await deleteRace({ id: 3 });
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/rowing/races/3'));
  });

  it('recordEntryStart posts to /rowing/entries/:id/start', async () => {
    mockedBase.post.mockResolvedValue({ success: true });
    await recordEntryStart({ entryId: 7, startTime: 1000 });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/entries/7/start'),
      { startTime: 1000 },
    );
  });

  it('recordEntryFinish posts to /rowing/entries/:id/finish', async () => {
    mockedBase.post.mockResolvedValue({ success: true });
    await recordEntryFinish({ entryId: 7, finishTime: 2000, elapsedMs: 1000 });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/rowing/entries/7/finish'),
      { finishTime: 2000, elapsedMs: 1000 },
    );
  });

  it('markEntryDns posts to /rowing/entries/:id/dns', async () => {
    mockedBase.post.mockResolvedValue({ success: true });
    await markEntryDns({ entryId: 9 });
    expect(mockedBase.post).toHaveBeenCalledWith(expect.stringContaining('/rowing/entries/9/dns'));
  });

  it('markEntryDnf posts to /rowing/entries/:id/dnf', async () => {
    mockedBase.post.mockResolvedValue({ success: true });
    await markEntryDnf({ entryId: 9 });
    expect(mockedBase.post).toHaveBeenCalledWith(expect.stringContaining('/rowing/entries/9/dnf'));
  });

  it('deleteEntry deletes /rowing/entries/:id', async () => {
    mockedBase.del.mockResolvedValue({ success: true });
    await deleteEntry({ entryId: 11 });
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/rowing/entries/11'));
  });
});
