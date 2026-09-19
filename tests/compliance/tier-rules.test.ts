import { DndChecker } from '../../src/compliance/dnd-checker';
import { QuietHoursChecker } from '../../src/compliance/quiet-hours';
import { FrequencyCapChecker } from '../../src/compliance/frequency-cap';
import { Tier } from '../../src/events/types';

describe('Tier-based Compliance Rules', () => {
  describe('DND Bypass', () => {
    const dndChecker = new DndChecker();

    it('CRITICAL tier should bypass DND', () => {
      expect(dndChecker.shouldBypassDnd(Tier.CRITICAL)).toBe(true);
    });

    it('HIGH tier should NOT bypass DND', () => {
      expect(dndChecker.shouldBypassDnd(Tier.HIGH)).toBe(false);
    });

    it('NORMAL tier should NOT bypass DND', () => {
      expect(dndChecker.shouldBypassDnd(Tier.NORMAL)).toBe(false);
    });

    it('LOW tier should NOT bypass DND', () => {
      expect(dndChecker.shouldBypassDnd(Tier.LOW)).toBe(false);
    });

    it('REGULATORY tier should NOT bypass DND', () => {
      expect(dndChecker.shouldBypassDnd(Tier.REGULATORY)).toBe(false);
    });
  });

  describe('Quiet Hours Bypass', () => {
    const quietHoursChecker = new QuietHoursChecker();

    it('CRITICAL tier should bypass Quiet Hours', () => {
      expect(quietHoursChecker.shouldBypassQuietHours(Tier.CRITICAL)).toBe(true);
    });

    it('HIGH tier should NOT bypass Quiet Hours', () => {
      expect(quietHoursChecker.shouldBypassQuietHours(Tier.HIGH)).toBe(false);
    });

    it('NORMAL tier should NOT bypass Quiet Hours', () => {
      expect(quietHoursChecker.shouldBypassQuietHours(Tier.NORMAL)).toBe(false);
    });

    it('LOW tier should NOT bypass Quiet Hours', () => {
      expect(quietHoursChecker.shouldBypassQuietHours(Tier.LOW)).toBe(false);
    });

    it('REGULATORY tier should NOT bypass Quiet Hours', () => {
      expect(quietHoursChecker.shouldBypassQuietHours(Tier.REGULATORY)).toBe(false);
    });
  });

  describe('Frequency Cap Bypass', () => {
    const frequencyCapChecker = new FrequencyCapChecker();

    it('CRITICAL tier should bypass Frequency Cap', () => {
      expect(frequencyCapChecker.shouldBypassFrequencyCap(Tier.CRITICAL)).toBe(true);
    });

    it('HIGH tier should NOT bypass Frequency Cap', () => {
      expect(frequencyCapChecker.shouldBypassFrequencyCap(Tier.HIGH)).toBe(false);
    });

    it('NORMAL tier should NOT bypass Frequency Cap', () => {
      expect(frequencyCapChecker.shouldBypassFrequencyCap(Tier.NORMAL)).toBe(false);
    });

    it('LOW tier should NOT bypass Frequency Cap', () => {
      expect(frequencyCapChecker.shouldBypassFrequencyCap(Tier.LOW)).toBe(false);
    });

    it('REGULATORY tier should NOT bypass Frequency Cap', () => {
      expect(frequencyCapChecker.shouldBypassFrequencyCap(Tier.REGULATORY)).toBe(false);
    });
  });
});
