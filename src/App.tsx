import React, { useMemo, useState, useEffect } from 'react';
import { NostrProvider, useNostrEvents, dateToUnix } from 'nostr-react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
} from '@mui/material';

function countLeadingZeroBits(hex: string): number {
  const bin = BigInt('0x' + hex).toString(2).padStart(256, '0');
  return bin.indexOf('1');
}

function Feed() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowIntro(false), 7500);
    return () => clearTimeout(timeout);
  }, []);

  const since = useMemo(() => dateToUnix(new Date(Date.now() - 60 * 60 * 1000)), []);
  const { events } = useNostrEvents({
    filter: { kinds: [1], since },
  });

  const notes = events
    .map(e => ({ ...e, pow: countLeadingZeroBits(e.id) }))
    .filter(n => n.pow >= 10)
    .sort((a, b) => b.pow - a.pow);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ⚡ Nostr Notes mit Proof-of-Work ⚡
      </Typography>

      {showIntro ? (
        <Typography variant="body1" color="text.secondary">
          👋 Welcome! Events will be displayed shortly…
        </Typography>
      ) : (
        notes.map(note => (
          <Card key={note.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Chip
                  label={`PoW: ${note.pow} bits`}
                  color={
                    note.pow >= 20
                      ? 'error'
                      : note.pow >= 16
                        ? 'warning'
                        : 'primary'
                  }
                />
              </Box>
              <Typography variant="body1">
                {note.content || <em>– empty –</em>}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}

export default function App() {
  const relays = useMemo(() => [
    'wss://relay.damus.io',
  ], []);

  return (
    <NostrProvider relayUrls={relays} debug>
      <Feed />
    </NostrProvider>
  );
}
