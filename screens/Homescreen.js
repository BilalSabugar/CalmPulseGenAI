import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { onSnapshot, collection, query, limit, orderBy, where } from 'firebase/firestore';
import db from '../firebase';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import StickyHeader from '../components/StickyHeader';
import { height, OfficeContactNumber, OfficeEmailOne, WA } from '../components/constants';
import { useThemeMode } from '../components/theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { loadHomePaymentsSnapshot } from '../services/payments.service';
import { getDisplayName } from '../components/get';
import { getGreeting } from '../utils/getGreeting';
import { loadLatestAnnouncements } from '../services/announcements.service';
import { useLiveClock } from '../utils/useLiveClock';

const { width: WIN_W } = Dimensions.get('window');
const isWide = WIN_W > height;

/** Build a palette from the theme flag */
function buildPalette(isDark) {
  return isDark
    ? {
      pageBg: '#0b1220',     // dark surface
      text: '#E5E7EB',
      textMuted: '#94A3B8',
      card: '#0f172a',
      cardBorder: '#1f2937',
      subtleBg: '#0b1220',
      subtleBorder: '#1f2937',
      pill: '#111827',
      accent: '#FFFFFF',
      accentText: '#0f172a',
      kpiTileBg: 'rgba(255,255,255,0.06)',
      kpiTileBorder: 'rgba(255,255,255,0.12)',
      badgeBg: '#FFFFFF',
      badgeText: '#0f172a',
      chipBg: 'rgba(2,6,23,0.35)',
      chipBorder: '#334155',
    }
    : {
      pageBg: '#f8fafc',     // slate-50
      text: '#0f172a',
      textMuted: '#64748b',
      card: '#ffffff',
      cardBorder: '#e5e7eb',
      subtleBg: '#f8fafc',
      subtleBorder: '#e5e7eb',
      pill: '#0f172a',
      accent: '#0f172a',
      accentText: '#ffffff',
      kpiTileBg: '#0f172a15',
      kpiTileBorder: '#0f172a25',
      badgeBg: '#0f172a',
      badgeText: '#ffffff',
      chipBg: '#f8fafc',
      chipBorder: '#cbd5e1',
    };
}

/** Recompute styles when palette changes */
const makeStyles = (P) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: P.pageBg },
    container: {
      maxWidth: 1120,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: 16,
      marginTop: 16,
      minHeight: height,
    },
    gridLG3: { flexDirection: isWide ? 'row' : 'column', gap: 16 },
    mainGrid: { flexDirection: isWide ? 'row' : 'column', gap: 16, marginTop: 16 },
    secondaryGrid: { flexDirection: isWide ? 'row' : 'column', gap: 16, marginTop: 16 },

    /* Cards */
    card: {
      backgroundColor: P.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: P.cardBorder,
      shadowColor: '#000',
      shadowOpacity: Platform.OS === 'web' ? 0.06 : 0.1,
      shadowRadius: 6,
    },
    kpiCard: {
      flex: isWide ? 1 : undefined,
      backgroundColor: P.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: P.cardBorder,
      padding: 16,
    },

    colSpan2: { flex: isWide ? 2 : undefined },

    p6: { padding: 16 },
    row: { flexDirection: 'row' },
    gap4: { columnGap: 16, rowGap: 16 },
    mt5: { marginTop: 20 },

    /* Hero Left */
    heroTitle: { fontSize: 22, fontWeight: '700', color: P.text },
    heroSub: { fontSize: 12, color: P.textMuted, marginTop: 4 },
    clockTime: { fontSize: 26, fontWeight: '800', color: P.text },
    clockDate: { fontSize: 12, color: P.textMuted },

    /* Quick actions */
    gridSM4: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 12,
      rowGap: 12,
    },
    quickCard: {
      flexGrow: 1,
      flexBasis: '45%',
      borderWidth: 1,
      borderColor: P.cardBorder,
      borderRadius: 12,
      backgroundColor: P.subtleBg,
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 8,
    },
    quickTxt: { fontSize: 13, fontWeight: '700', color: P.text },

    /* KPI */
    kpiHeader: {
      color: P.textMuted,
      fontSize: 12,
      marginBottom: 8,
      opacity: 0.9,
      display: Platform.OS === 'web' ? 'block' : 'none',
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 12,
      rowGap: 12,
      marginTop: 8,
    },
    kpiTile: {
      flexGrow: 1,
      flexBasis: '45%',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: P.kpiTileBg,
      borderWidth: 1,
      borderColor: P.kpiTileBorder,
    },
    kpiLabel: { color: P.textMuted, fontSize: 11 },
    kpiValue: { color: P.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
    kpiLink: { marginTop: 12, fontSize: 12, textDecorationLine: 'underline', color: P.text },

    /* Section header */
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: P.text },
    sectionSub: { fontSize: 12, fontWeight: '700', color: P.text },

    /* Recent documents */
    divider: { height: 1, backgroundColor: P.cardBorder, marginTop: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, columnGap: 10 },
    badge: { backgroundColor: P.badgeBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
    badgeTxt: { color: P.badgeText, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    docTitle: { fontSize: 13, fontWeight: '600', color: P.text },
    docMeta: { fontSize: 11, color: P.textMuted },
    downloadBtn: {
      borderWidth: 1,
      borderColor: P.chipBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: P.chipBg,
    },
    downloadTxt: { fontSize: 12, color: P.text },

    listSep: { height: 8 },

    /* Dues / Tx */
    dueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: P.cardBorder,
      borderRadius: 12,
      padding: 12,
      backgroundColor: P.subtleBg,
    },
    dueLabel: { fontSize: 12, fontWeight: '600', color: P.text },
    dueMeta: { fontSize: 11, color: P.textMuted, marginTop: 2 },
    dueAmt: { fontSize: 12, fontWeight: '800', color: P.text },

    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: P.cardBorder,
      backgroundColor: P.subtleBg,
      paddingVertical: 8,
      paddingHorizontal: 10,
      justifyContent: 'space-between',
    },
    txLabel: { flex: 1, fontSize: 12, color: P.text, marginRight: 8 },
    txAmt: { fontSize: 12, fontWeight: '800', color: P.text, marginRight: 8 },
    txTs: { fontSize: 10, color: P.textMuted },

    /* Secondary row */
    note: {
      borderWidth: 1,
      borderColor: P.cardBorder,
      borderRadius: 12,
      padding: 10,
      backgroundColor: P.subtleBg,
    },
    noteTxt: { fontSize: 12, color: P.text },

    helpGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 10, marginTop: 8 },
    helpTile: {
      flexGrow: 1,
      flexBasis: '45%',
      borderWidth: 1,
      borderColor: P.cardBorder,
      borderRadius: 12,
      padding: 12,
      backgroundColor: P.subtleBg,
    },
    helpTxt: { fontSize: 12, color: P.text },
  });

export default function Homescreen() {
  const navigation = useNavigation();
  const [docsLive, setDocsLive] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalDue, setTotalDue] = useState(0);
  const [thisMonthPayments, setThisMonthPayments] = useState(0);
  const [oldDues, setOldDues] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [tickets, setTickets] = useState(0);
  const [user, setUser] = useState('');
  const [greeting, setGreeting] = useState(getGreeting());
  const [ann, setAnn] = React.useState([]);
  const [loadingAnn, setLoadingAnn] = React.useState(true);

  // THEME: read isDark from provider
  const { isDark } = useThemeMode();
  const P = useMemo(() => buildPalette(isDark), [isDark]);
  const styles = useMemo(() => makeStyles(P), [P]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await loadHomePaymentsSnapshot();
        if (!alive) return;
        setTotalDue(res.totalDue);
        setOldDues(res.oldDues);
        setRecentTx(res.recentTransactions);
        setThisMonthPayments(res.thisMonthPayments);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const items = await loadLatestAnnouncements({ n: 2, onlyActive: true });
        if (alive) setAnn(items);
      } finally {
        if (alive) setLoadingAnn(false);
      }
    })();
    return () => { alive = false; };
  }, []);


  useEffect(() => {
    getDisplayName().then(name => {
      setUser(name)
    })
    // Update greeting every minute
    const id = setInterval(() => setGreeting(getGreeting()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let unsub;
    (async () => {
      const uid = await AsyncStorage.getItem('email');
      if (!uid) { navigation.navigate("WelcomeScreen") };

      const q = query(
        collection(db, uid),
        orderBy('createdAt', 'desc'),
        limit(4)
      );

      unsub = onSnapshot(q, (snap) => {
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setDocsLive(rows);
      });

      const r = query(
        collection(db, 'tickets'),
        where('userId', '==', uid),
        where('status', '==', "Active")
      );

      onSnapshot(r, (snap) => {
        const t = snap.docs.map((d) => d.data());
        setTickets(t.length);
      });
    })();

    return () => unsub && unsub();
  }, []);

  const openKnowledgeBase = () => navigation.navigate('NeedHelp'); // your FAQ screen
  const openSecurityPrivacy = () => navigation.navigate('Privacy'); // your privacy/terms screen

  const openChatSupport = async () => {
    // Prefer WhatsApp; fallback to email
    const can = await Linking.canOpenURL(WA);
    if (can) return Linking.openURL(WA);
    return Linking.openURL(`mailto:${OfficeEmailOne}?subject=Support%20Request`);
  };

  const openRaiseTicket = async () => {
    navigation.navigate('NeedHelp', {
      openTicket: true,
      prefill: {
        type: 'Other',
        subject: '',
        txnId: '',
      },
    });
  };

  const onHelpPress = async (label) => {
    if (label.includes('Knowledge')) return openKnowledgeBase();
    if (label.includes('Chat')) return openChatSupport();
    if (label.includes('Ticket')) return openRaiseTicket();
    if (label.includes('Security') || label.includes('Privacy')) return openSecurityPrivacy();
  };

  const quick = [
    { key: 'upload', label: 'Upload Files', icon: 'upload-cloud', onPress: () => setModalVisible(true) },
    { key: 'docs', label: 'Your Documents', icon: 'folder', onPress: () => { navigation.navigate('Documents') } },
    { key: 'dues', label: 'Dues', icon: 'file-text', onPress: () => navigation.navigate('Dues') },  // <-- navigate
    { key: 'txn', label: 'Transactions', icon: 'list', onPress: () => { navigation.navigate('Transactions') } },
  ];

  const { timeStr, dateStr } = useLiveClock({
    withSeconds: false,
  });

  const renderDocRow = ({ item }) => {
    const typ = (item?.type || 'FILE').toUpperCase().slice(0, 6);
    const meta =
      item?.createdAtFormatted ||
      formatMeta(item?.createdAt || item?.ts || new Date().toISOString());
    return (
      <View style={styles.docRow}>
        <View style={styles.badge}><Text style={styles.badgeTxt}>{typ}</Text></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.docTitle}>{item?.title || 'Untitled'}</Text>
          <Text style={styles.docMeta}>{meta}</Text>
        </View>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => {
          navigation.navigate('DocumentViewer', {
            ownerEmail: item.userId || item.uploadedBy || email,
            docId: item.id, // your Firestore document id (timestamp)
          });
        }}>
          <Text style={styles.downloadTxt}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <StickyHeader
        active="Your Documents"
        isLoggedIn={true}
        onLogout={() => { }}
      />

      <View>
        <View style={styles.container}>
          {/* Hero + Quick Actions + KPI row */}
          <View style={styles.gridLG3}>
            {/* Left: greeting card */}
            <View style={[styles.card, styles.p6, styles.colSpan2]}>
              <View
                style={[
                  styles.row,
                  styles.gap4,
                  {
                    alignItems: isWide ? 'flex-end' : 'flex-start',
                    justifyContent: 'space-between',
                    flexDirection: isWide ? 'row' : 'column',
                  },
                ]}
              >
                <View>
                  <Text style={styles.heroTitle}>{greeting}, {user}</Text>
                  <Text style={styles.heroSub}>Here’s a quick snapshot of your workspace.</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.clockTime}>{timeStr}</Text>
                  <Text style={styles.clockDate}>{dateStr}</Text>
                </View>
              </View>

              {/* Quick actions */}
              <View style={[styles.gridSM4, styles.mt5]}>
                {quick.map((q) => (
                  <TouchableOpacity
                    key={q.key}
                    onPress={q.onPress}
                    activeOpacity={0.9}
                    style={styles.quickCard}
                  >
                    <Feather name={q.icon} size={18} color={P.text} />
                    <Text style={styles.quickTxt}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Right: KPI snapshot */}
            <View style={[styles.kpiCard]}>
              <Text style={styles.kpiHeader}>Account Snapshot</Text>
              <View style={styles.kpiGrid}>
                <KPI label="Pending Dues" value={"₹ " + totalDue.toLocaleString('en-IN')} />
                <KPI label="This Month Payments" value={`₹ ${thisMonthPayments.toLocaleString('en-IN')}`} />
                <KPI label="Files Uploaded" value={`${docsLive.length}`} />
                <KPI label="Open Tickets" value={tickets} />
              </View>
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Dues')} >
                <Text style={styles.kpiLink}>View full report →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main content: Recent Documents + Dues/Tx */}
          <View style={styles.mainGrid}>
            {/* Recent Documents */}
            <View style={[styles.card, styles.p6, styles.colSpan2]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Documents</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Documents')}>
                  <Text style={styles.kpiLink}>View all</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />
              {docsLive.length === 0 ? (
                <Text style={{ color: P.textMuted, fontSize: 13, marginTop: 8 }}>
                  No documents yet.
                </Text>
              ) : (
                <FlatList
                  data={docsLive}
                  keyExtractor={(it) => it.id}
                  renderItem={renderDocRow}
                  ItemSeparatorComponent={() => <View style={styles.listSep} />}
                  scrollEnabled={false}
                  contentContainerStyle={{ paddingTop: 8 }}
                />
              )}
            </View>

            {/* Right panel: Dues + Recent Tx */}
            <View style={[styles.card, styles.p6]}>
              <Text style={styles.sectionTitle}>Dues</Text>
              <View style={{ marginTop: 10, gap: 10 }}>
                {oldDues.length > 0 ?
                  oldDues.map((d) => (
                    <View key={d.id} style={styles.dueRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dueLabel}>{d.label}</Text>
                        <Text style={styles.dueMeta}>Due {d.dueDate}</Text>
                      </View>
                      <Text style={styles.dueAmt}>₹ {Number(d.amount || 0).toLocaleString('en-IN')}</Text>
                    </View>
                  ))
                  : (
                    <View style={styles.dueRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dueLabel}>No dues!</Text>
                        <Text style={styles.dueMeta}>Keep it up.</Text>
                      </View>
                    </View>
                  )
                }
              </View>

              <Text style={[styles.sectionSub, { marginTop: 16 }]}>Recent Transactions</Text>
              <View style={{ marginTop: 8, gap: 8 }}>
                {recentTx.length > 0 ?
                  recentTx.map((t) => (
                    <View key={t.id} style={styles.txRow}>
                      <Text numberOfLines={1} style={styles.txLabel}>{t.label}</Text>
                      <Text style={styles.txAmt}>{t.amount}</Text>
                      <Text style={styles.txTs}>{t.ts}</Text>
                    </View>
                  ))
                  : (
                    <View style={[styles.txRow, { flexDirection: "column", alignItems: "flex-start" }]}>
                      <Text numberOfLines={1} style={styles.txLabel}>No transaction has been made.</Text>
                      <Text style={styles.txTs}>You haven't mad any transactions.</Text>
                    </View>
                  )
                }
              </View>
            </View>
          </View>

          {/* Secondary row */}
          <View style={styles.secondaryGrid}>
            <View style={[styles.card, styles.p6]}>
              <Text style={styles.sectionTitle}>Announcements</Text>
              <View style={{ marginTop: 10, gap: 10 }}>
                {loadingAnn ? (
                  <View style={styles.note}><Text style={styles.noteTxt}>Loading…</Text></View>
                ) : ann.length ? (
                  ann.map(a => (
                    <View key={a.id} style={styles.note}>
                      <Text style={styles.noteTxt}>{a.text}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.note}>
                    <Text style={styles.noteTxt}>No announcements.</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={[styles.card, styles.p6, styles.colSpan2]}>
              <Text style={styles.sectionTitle}>Help & Support</Text>
              <View style={styles.helpGrid}>
                {['📄 Knowledge Base', '💬 Chat with Support', '🧾 Raise a Ticket', '🔐 Security & Privacy'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => onHelpPress(t)}
                    activeOpacity={0.9}
                    style={styles.helpTile}
                  >
                    <Text style={styles.helpTxt}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        </View>

        <Footer />
      </View>

      <UploadDocumentModal isVisible={modalVisible} closeModal={() => setModalVisible(false)} />
    </View>
  );
}

/* -------- Helpers -------- */

function KPI({ label, value }) {
  // palette is embedded via parent styles (no separate theme hook needed here)
  const { isDark } = useThemeMode();
  const P = buildPalette(isDark);
  const s = StyleSheet.create({
    tile: {
      flexGrow: 1,
      flexBasis: '45%',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: P.kpiTileBg,
      borderWidth: 1,
      borderColor: P.kpiTileBorder,
    },
    label: { color: P.textMuted, fontSize: 11 },
    value: { color: P.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
  });
  return (
    <View style={s.tile}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

function formatMeta(iso) {
  try {
    const d = new Date(iso);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const day = d
      .toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
      .toUpperCase();
    return `${time} · ${day}`;
  } catch {
    return iso;
  }
}

function HelpTile({ icon, label, onPress, C }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.card,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
      accessibilityLabel={label}
    >
      <Feather name={icon} size={16} color={C.text} />
      <Text style={{ color: C.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}
