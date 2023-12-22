import { create } from 'zustand';
import { ObjectId } from 'mongoose';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFetch } from '@/helpers/client';
import { useAlertService } from '@/services/index';

export { usePlayerService };

// player state store
const initialState: IPlayerStore = {
    players: undefined,
    player: undefined,
    currentPlayer: undefined
};
const playerStore = create<IPlayerStore>(() => initialState);

function usePlayerService(): IPlayerService {
    const alertService = useAlertService();
    const fetch = useFetch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentPlayer, player, players } = playerStore();

    return {
        players,
        player,
        currentPlayer,
        getAll: async () => {
            playerStore.setState({ players: await fetch.get('/api/players') });
        },
        getById: async (id: string) => {
            playerStore.setState({ player: undefined });
            try {
                playerStore.setState({ player: await fetch.get(`/api/players/${id}`) });
            } catch (error: any) {
                alertService.error(error);
            }
        },
        create: async (player: IPlayer) => {
            await fetch.post('/api/players', player);
        },
        update: async (id: string, params: Partial<IPlayer>) => {
            await fetch.put(`/api/players/${id}`, params);
        },
        delete: async (id: string) => {
            // set isDeleting prop to true on player
            playerStore.setState({
                players: players!.map(x => {
                    if (x.id === id) { x.isDeleting = true; }
                    return x;
                })
            });

            // delete player
            const response = await fetch.delete(`/api/players/${id}`);

            // remove deleted player from state
            playerStore.setState({ players: players!.filter(x => x.id !== id) });
        }
    };
};

// interfaces

interface IPlayer {
    userId: ObjectId,
    id: string,
    title: string,
    playerConfiguration: Object,
    sources: { label: string, url: string }[]
    isDeleting?: boolean
}

interface IPlayerStore {
    players?: IPlayer[],
    player?: IPlayer,
    currentPlayer?: IPlayer,
}

interface IPlayerService extends IPlayerStore {
    getAll: () => Promise<void>,
    getById: (id: string) => Promise<void>,
    create: (user: IPlayer) => Promise<void>,
    update: (id: string, params: Partial<IPlayer>) => Promise<void>,
    delete: (id: string) => Promise<void>
}