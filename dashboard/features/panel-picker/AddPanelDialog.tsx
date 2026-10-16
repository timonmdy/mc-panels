import React, { useMemo, useState } from 'react';
import { EmptyState, Icon, Input, Modal } from '../../framework/ui';
import { listPanelDefinitions, PanelCategory } from '../../panels/registry';
import { Card, Cards, Category } from './AddPanelDialog.styles';

const CATEGORY_ORDER: PanelCategory[] = ['Performance', 'Players', 'Server', 'Moderation', 'Utility'];

interface Props {
    existingTypes: string[];
    onAdd: (type: string) => void;
    onClose: () => void;
}

export const AddPanelDialog = ({ existingTypes, onAdd, onClose }: Props) => {
    const [query, setQuery] = useState('');

    const groups = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const matches = listPanelDefinitions().filter((d) => !needle || `${d.title} ${d.description}`.toLowerCase().includes(needle));

        return CATEGORY_ORDER.map((category) => ({ category, items: matches.filter((d) => d.category === category) })).filter((g) => g.items.length);
    }, [query]);

    return (
        <Modal title='Add panel' onClose={onClose} width={760}>
            <Input autoFocus placeholder='Search panels' value={query} onChange={(e) => setQuery(e.target.value)} />
            {!groups.length && <EmptyState icon='search' title='No panels match' hint='Try a different search term.' />}
            {groups.map(({ category, items }) => (
                <section key={category}>
                    <Category>{category}</Category>
                    <Cards>
                        {items.map((definition) => {
                            const taken = !definition.multiple && existingTypes.includes(definition.type);

                            return (
                                <Card key={definition.type} type='button' disabled={taken} onClick={() => { onAdd(definition.type); onClose(); }}>
                                    <Icon name={definition.icon} fixedWidth />
                                    <strong>{definition.title}</strong>
                                    <small>{taken ? 'Already on this profile' : definition.description}</small>
                                </Card>
                            );
                        })}
                    </Cards>
                </section>
            ))}
        </Modal>
    );
};
