import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/wallet_service.dart';

class WalletButton extends StatelessWidget {
  const WalletButton({super.key});

  @override
  Widget build(BuildContext context) {
    final walletService = context.watch<WalletService>();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: walletService.isConnected
          ? PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'disconnect') {
                  walletService.disconnectWallet();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'disconnect',
                  child: Row(
                    children: [
                      const Icon(Icons.logout),
                      const SizedBox(width: 8),
                      const Text('Disconnect'),
                    ],
                  ),
                ),
              ],
              child: Chip(
                avatar: const Icon(Icons.account_balance_wallet, size: 20),
                label: Text(
                  '${walletService.address.substring(0, 6)}...${walletService.address.substring(walletService.address.length - 4)}',
                  style: const TextStyle(fontSize: 14),
                ),
                backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
              ),
            )
          : ElevatedButton.icon(
              onPressed: () => walletService.connectWallet(),
              icon: const Icon(Icons.account_balance_wallet),
              label: const Text('Connect'),
            ),
    );
  }
} 